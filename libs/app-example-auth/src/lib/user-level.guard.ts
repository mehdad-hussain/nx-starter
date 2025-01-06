import { CanMatchFn, Router } from '@angular/router'
import { AuthStateService } from './auth-state.service'
import { UserLevel } from '@myorg/app-example-models'
import { inject } from '@angular/core'


export function userLevelGuardFn(allowedLevels: UserLevel[]): CanMatchFn {
    return (route, segments) => {
        const authStateService = inject(AuthStateService)
        const router = inject(Router)

        const userLevel = authStateService.getUserLevel()
        const groupId = authStateService.getGroupId()

        // Allow access if:
        // 1. User is Admin/Moderator and has a groupId, OR
        // 2. User is User and has no groupId
        if (allowedLevels.include(userLevel)) {
            return true
        }

        // Deny access and redirect
        const currentUrl = segments.map((segment) => segment.path).join('/')
        return router.createUrlTree(['/access-denied'], {
            queryParams: { returnUrl: currentUrl },
        })
    }
}
