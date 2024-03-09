import {
    APP_INITIALIZER,
    ApplicationConfig,
    importProvidersFrom,
} from '@angular/core'
import {
    PreloadAllModules,
    provideRouter,
    withComponentInputBinding,
    withInMemoryScrolling,
    withPreloading,
    withRouterConfig,
} from '@angular/router'
import { appRoutes } from './app.routes'
import { LucideAngularModule, icons } from 'lucide-angular'
import { NgxSmartModalModule } from 'ngx-smart-modal'
import { BrowserModule } from '@angular/platform-browser'
import { provideAnimations } from '@angular/platform-browser/animations'
import { appInitializerFactory } from '@my-nx-starter/app-example-core'
import { AuthStateService } from '@my-nx-starter/app-example-auth'
import { AuthApiService, AuthHeaderInterceptorFn, TokenStorageService } from '@my-nx-starter/common-auth'
import { LocalStorageService } from '@my-nx-starter/common-services'
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common'
import { provideHttpClient, withXsrfConfiguration, withJsonpSupport, withInterceptors, withInterceptorsFromDi } from '@angular/common/http'

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            appRoutes,
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
            withRouterConfig({ onSameUrlNavigation: 'reload' }),
            withComponentInputBinding(),
            withPreloading(PreloadAllModules),
        ),
        provideHttpClient(
            withXsrfConfiguration({}),
            withJsonpSupport(),
            withInterceptors([AuthHeaderInterceptorFn]),
            withInterceptorsFromDi(),
        ),
        importProvidersFrom(LucideAngularModule.pick(icons)),
        importProvidersFrom(NgxSmartModalModule.forRoot()),
        importProvidersFrom(BrowserModule),
        provideAnimations(),
        {
            provide: APP_INITIALIZER,
            useFactory: appInitializerFactory,
            multi: true,
            deps: [
                AuthStateService,
                AuthApiService,
                TokenStorageService,
                LocalStorageService,
            ],
        },
        {
            provide: DATE_PIPE_DEFAULT_OPTIONS,
            useValue: { timezone: 'UTC', dateFormat: 'shortDate' },
        },
    ],
}
