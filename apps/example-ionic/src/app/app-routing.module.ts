import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'

const routes: Routes = [
    {
        path: '',
        redirectTo: 'welcome',
        pathMatch: 'full',
    },

    {
        path: 'welcome',
        loadComponent: () =>
            import(
                './pages/page-welcome/page-welcome1/page-welcome1.component'
            ).then((m) => m.PageWelcome1Component),
    },
    {
        path: 'welcome2',
        loadComponent: () =>
            import(
                './pages/page-welcome/page-welcome2/page-welcome2.component'
            ).then((m) => m.PageWelcome2Component),
    },
    {
        path: 'welcome3',
        loadComponent: () =>
            import(
                './pages/page-welcome/page-welcome3/page-welcome3.component'
            ).then((m) => m.PageWelcome3Component),
    },

    {
        path: 'login',
        loadComponent: () =>
            import('./pages/page-login/page-login.component').then(
                (m) => m.PageLoginComponent,
            ),
    },

    {
        path: 'register',
        loadComponent: () =>
            import('./pages/page-register/page-register.component').then(
                (m) => m.PageRegisterComponent,
            ),
    },
    {
        path: 'profile',
        loadComponent: () =>
            import('./pages/page-profile/page-profile.component').then(
                (m) => m.PageProfileComponent,
            ),
    },
    {
        path: 'home',
        loadComponent: () =>
            import('./pages/page-home/page-home.component').then(
                (m) => m.PageHomeComponent,
            ),
    },
    {
        path: 'forgot-password',
        loadComponent: () =>
            import(
                './pages/page-forgot-password/page-forgot-password.component'
            ).then((m) => m.PageForgotPasswordComponent),
    },
    {
        path: 'reset-password',
        loadComponent: () =>
            import(
                './pages/page-reset-password/page-reset-password.component'
            ).then((m) => m.PageResetPasswordComponent),
    },
    {
        path: 'account-created',
        loadComponent: () =>
            import(
                './pages/page-account-created/page-account-created.component'
            ).then((m) => m.PageAccountCreatedComponent),
    },
    {
        path: 'account-verified',
        loadComponent: () =>
            import(
                './pages/page-account-verified/page-account-verified.component'
            ).then((m) => m.PageAccountVerifiedComponent),
    },
    {
        path: 'dashboard/cases',
        loadComponent: () =>
            import('./pages/page-cases/page-cases.component').then(
                (m) => m.PageCasesComponent,
            ),
    },
    {
        path: 'dashboard/case',
        loadComponent: () =>
            import('./pages/page-case/page-case.component').then(
                (m) => m.PageCaseComponent,
            ),
    },
    {
        path: 'dashboard/clients',
        loadComponent: () =>
            import('./pages/page-clients/page-clients.component').then(
                (m) => m.PageClientsComponent,
            ),
    },
    {
        path: 'dashboard/chats',
        loadComponent: () =>
            import('./pages/page-chats/page-chats.component').then(
                (m) => m.PageChatsComponent,
            ),
    },
    {
        path: 'dashboard/chat',
        loadComponent: () =>
            import('./pages/page-chat/page-chat.component').then(
                (m) => m.PageChatComponent,
            ),
    },
    {
        path: 'dashboard/appointments',
        loadComponent: () =>
            import(
                './pages/page-appointments/page-appointments.component'
            ).then((m) => m.PageAppointmentsComponent),
    },
    {
        path: 'dashboard/organizations',
        loadComponent: () =>
            import(
                './pages/page-organizations/page-organizations.component'
            ).then((m) => m.PageOrganizationsComponent),
    },
    {
        path: 'admin/userlist',
        loadComponent: () =>
            import(
                './pages/page-admin-userlist/page-admin-userlist.component'
            ).then((m) => m.PageAdminUserlistComponent),
    },
    {
        path: 'lawyer/home',
        loadComponent: () =>
            import(
                './pages/lawyer-accout-pages/page-lawyer-home/page-lawyer-home.component'
            ).then((m) => m.PageLawyerHomeComponent),
    },
    {
        path: 'lawyer/organization',
        loadComponent: () =>
            import(
                './pages/lawyer-accout-pages/page-lawyer-organization/page-lawyer-organization.component'
            ).then((m) => m.PageLawyerOrganizationComponent),
    },
    {
        path: 'lawyer/profile',
        loadComponent: () =>
            import(
                './pages/lawyer-accout-pages/page-lawyer-profile/page-lawyer-profile.component'
            ).then((m) => m.PageLawyerProfileComponent),
    },
    {
        path: 'lawyer/plans',
        loadComponent: () =>
            import(
                './pages/lawyer-accout-pages/page-lawyer-plans/page-lawyer-plans.component'
            ).then((m) => m.PageLawyerPlansComponent),
    },
    {
        path: 'lawyer/settings',
        loadComponent: () =>
            import(
                './pages/lawyer-accout-pages/page-lawyer-settings/page-lawyer-settings.component'
            ).then((m) => m.PageLawyerSettingsComponent),
    },
    {
        path: 'public/lawyers',
        loadComponent: () =>
            import(
                './pages/public-pages/page-public-lawyer/page-public-lawyer.component'
            ).then((m) => m.PagePublicLawyerComponent),
    },
    {
        path: 'public/blogs',
        loadComponent: () =>
            import(
                './pages/public-pages/page-public-blogs/page-public-blogs.component'
            ).then((m) => m.PagePublicBlogsComponent),
    },
    {
        path: 'public/news',
        loadComponent: () =>
            import(
                './pages/public-pages/page-public-news/page-public-news.component'
            ).then((m) => m.PagePublicNewsComponent),
    },
]

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
