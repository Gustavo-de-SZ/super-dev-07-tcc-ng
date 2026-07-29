import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { map, catchError, of, switchMap, tap } from 'rxjs';

export const profileGuardFn: CanActivateFn = (route, state) => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  return profileService.verificarPerfilExistente().pipe(
    switchMap(res => {
      // 1. If no profile exists, send to registration
      if (!res.exists) {
        router.navigate(['/completar-cadastro']);
        return of(false);
      }

      // 2. If the user is a technician, check if they are approved
      if (res.type === 'tecnico') {
        return profileService.obterPerfilTecnico().pipe(
          map(tecnico => {
            if (tecnico && tecnico.aprovado_pelo_admin === false) {
               // Prevent access and redirect to the pending page
               router.navigate(['/pendente-aprovacao']);
               return false;
            }
            // If approved (true) or if the field is not present (edge case), let them through to /painel
            return true;
          }),
          catchError(() => {
            // Failsafe: if the request fails, don't let them in blindly (security first)
            // But also don't bounce them around on temporary errors
            // For now, let's treat it as not approved to be safe
            router.navigate(['/pendente-aprovacao']);
            return of(false);
          })
        );
      }

      // 3. If it's a 'cliente' (or admin), allow them through
      return of(true);
    }),
    catchError(() => {
      // Failsafe for network errors in inicial check
      // In production, you might want to be more restrictive here
      return of(true); // Allow through to avoid locking users out on temporary issues
    })
  );
};
