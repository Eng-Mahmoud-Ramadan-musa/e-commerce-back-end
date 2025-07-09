import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { CategoryRepository } from 'src/DB';
import { CloudService } from '../Services';
import { generateOTP } from '../Utils';

export function CategoryFileUpdateInterceptor(folderName?: string): Type<NestInterceptor> {

  @Injectable()
 class MixinInterceptor implements NestInterceptor {
  constructor(
    private readonly cloudService: CloudService,
    private readonly categoryRepository: CategoryRepository,
  ) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest();
      const file = request.file as Express.Multer.File;
      if (file) {
        let folderId: string;
        let category: any;
        if (!folderName) {
          category = await this.categoryRepository.findById({id:request.params.id});
          folderId = category?.image?.folderId as string
        } else {
          folderId = `e_commerce/${folderName}/${generateOTP(6)}`;
        }

        const result = folderName
        ? await this.cloudService.uploadFile({ path: file.path, folder: folderId })
        : await this.cloudService.updateFile(category.image.public_id, file.path, folderId);
      
          request.body.image = {
            secure_url: result.secure_url,
            public_id: result.public_id,
            folderId,
          }
      }

      return next.handle().pipe(
        catchError((error) => {
          if (request?.body?.folderId) {
            this.cloudService.deleteFolder(request.body.folderId);
          }
          return throwError(() => error);
        }),
      );
  }
}
    return mixin(MixinInterceptor);
  }
  
