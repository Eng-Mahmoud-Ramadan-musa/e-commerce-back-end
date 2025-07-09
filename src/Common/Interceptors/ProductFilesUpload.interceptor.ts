import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Type,
  mixin,
} from '@nestjs/common';
import { Request } from 'express';
import { catchError, Observable, throwError } from 'rxjs';
import { CloudService } from 'src/Common/Services/cloud.service';
import { generateOTP } from '../Utils';
import { ProductRepository } from 'src/DB';

export function ProductFilesUploadInterceptor(folderName?: string): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    constructor(
      private readonly cloudService: CloudService,
      private readonly productRepository: ProductRepository,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest() as Request;
      const files = request.files as Express.Multer.File[];

        if (files && files.length > 0) {
          let folderId: string;

          if (!folderName) {
            const product = await this.productRepository.findOne({ filter: { _id: request.params.id } });
            folderId = product?.folderId as string
          } else {
            folderId = `e_commerce/${folderName}/${generateOTP(6)}`;
          }

          const images: { secure_url: string; public_id: string }[] = [];
          if (!folderName) {
            this.cloudService.deleteFolder(folderId);
}
          for (const file of files) {
            const { secure_url, public_id } = await this.cloudService.uploadFile({
              path: file.path,
              folder: folderId,
            });
            images.push({ secure_url, public_id });
          }

          request.body.images = images;
          request.body.folderId = folderId;
        }

        return next.handle().pipe(
          catchError((error) => {
            if (request.files && request.body.folderId) {
              this.cloudService.deleteFolder(request.body.folderId);
            }
            return throwError(() => error);
          }),
        );
    }
  }

  return mixin(MixinInterceptor);
}
