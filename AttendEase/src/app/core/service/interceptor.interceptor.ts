import { HttpInterceptorFn } from '@angular/common/http';

export const interceptorInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('login')) {
    return next(req);
  }

  const myToken = sessionStorage.getItem('token');

  const authorizedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${myToken}`,
    },
  });

  return next(authorizedRequest);
};
