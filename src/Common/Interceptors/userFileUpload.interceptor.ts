import { Type, NestInterceptor, Injectable, ExecutionContext, CallHandler, mixin } from "@nestjs/common";
import { Observable, catchError, throwError } from "rxjs";
import { CloudService } from "../Services";
import { generateOTP } from "../Utils";

export function UserFileUploadInterceptor(folderName?: string): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    constructor(private readonly cloudService: CloudService) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest();
      const file = request.file as Express.Multer.File;

      if (file) {
        const folderId = `e_commerce/${folderName || 'users'}/${generateOTP(6)}`;
        let result;

        if (folderName) {
          // رفع صورة جديدة في فولدر معين
          result = await this.cloudService.uploadFile({ path: file.path, folder: folderId });
        } else {
          // تحديث الصورة الحالية إذا وجدت، أو رفع جديدة
          const userPic = request.user?.profilePic;
          if (userPic?.public_id) {
            try {
              result = await this.cloudService.updateFile(userPic.public_id, file.path, folderId);
            } catch (err) {
              // fallback إلى رفع جديد في حال فشل التحديث
              result = await this.cloudService.uploadFile({ path: file.path, folder: folderId });
            }
          } else {
            result = await this.cloudService.uploadFile({ path: file.path, folder: folderId });
          }
        }

        request.body.image = {
          secure_url: result.secure_url,
          public_id: result.public_id,
          folderId,
        };
      }

      return next.handle().pipe(
        catchError((error) => {
          if (request.body?.image?.folderId) {
            this.cloudService.deleteFolder(request.body.image.folderId);
          }
          return throwError(() => error);
        }),
      );
    }
  }

  return mixin(MixinInterceptor);
}
