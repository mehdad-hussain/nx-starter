import { Component, inject } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { AuthStateService } from '@myorg/app-example-auth'
import { AlertService } from '@myorg/app-example-core'
import { LoginFormService } from '@myorg/common-auth'
import { PrimeModules } from '@myorg/prime-modules'
import { SpartanModules } from '@myorg/spartan-modules'
import { HlmInputDirective } from '@spartan-ng/ui-input-helm'

@Component({
    selector: 'app-page-login',
    standalone: true,
    imports: [
        ...SpartanModules,
        ...PrimeModules,
        ReactiveFormsModule,
        RouterModule,
        HlmInputDirective,
    ],
    templateUrl: './page-login.component.html',
    styleUrl: './page-login.component.scss',
    providers: [LoginFormService],
})
export class PageLoginComponent {
    private authStateService = inject(AuthStateService)
    private returnUrl = ''

    loginFormService = inject(LoginFormService)

    loading = false
    errors: string[] = []

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private alertService: AlertService,
    ) {}

    ngOnInit(): void {
        this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] ?? '/'
        if (this.authStateService.isLoggedIn()) this.router.navigateByUrl(this.returnUrl)
    }

    submit(): void {
        if (this.loading) return

        if (this.loginFormService.loginForm.invalid) {
            this.errors.push('Invalid Credentials')
        }

        this.errors = []
        this.loading = true

        const { email, password } = this.loginFormService.getValue()
        this.authStateService.login(email, password).subscribe({
            next: (res) => {
                this.loading = false
                this.router.navigateByUrl(this.returnUrl)
            },
            error: (err) => {
                this.loading = false
                this.alertService.error('Email or password incorrect. Please try again')
            },
        })
    }
}
