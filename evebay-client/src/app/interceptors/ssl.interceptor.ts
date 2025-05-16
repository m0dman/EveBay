import { HttpInterceptorFn } from '@angular/common/http';

export const sslInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request and set withCredentials to true
  const modifiedReq = req.clone({
    withCredentials: true
  });

  return next(modifiedReq);
}; 