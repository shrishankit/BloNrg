import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get the auth token from localStorage
  const token = localStorage.getItem('token');

  // If we have a token, clone the request and add the authorization header
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  // If no token, proceed with the original request
  return next(req);
}; 