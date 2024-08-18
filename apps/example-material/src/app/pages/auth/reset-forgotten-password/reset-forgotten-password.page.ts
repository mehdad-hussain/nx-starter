import { Component, OnInit, inject } from '@angular/core'
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { getAuthRoutes } from '../auth.routes'
import { AuthApiService, JwtService } from '@myorg/common-auth'
import { AlertService } from '../../../main/alert/services/toast.service'
import { ForgotPasswordVerificationToken } from '@myorg/common-auth'
import { User } from '@myorg/app-example-models'

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './reset-forgotten-password.page.html',
    styleUrls: ['./reset-forgotten-password.page.scss'],
})
export default class ResetForgottenPasswordPage implements OnInit {
    private router = inject(Router)
    private activeRoute = inject(ActivatedRoute)
    private alertService = inject(AlertService)
    private jwtService = inject(JwtService)
    private authApiService = inject<AuthApiService<User>>(AuthApiService)

    userInfo: ForgotPasswordVerificationToken | null = null
    form: FormGroup = new FormGroup({
        password: new FormControl('', [
            Validators.required,
            Validators.minLength(8),
        ]),
        passwordConfirmation: new FormControl('', [
            Validators.required,
            Validators.minLength(8),
        ]),
    })

    ngOnInit(): void {
        this.userInfo = this.jwtService.decodeToken(
            this.activeRoute.snapshot.params['token'],
        )
    }

    resetPasswordSubmitted() {
        if (!this.userInfo) return

        const { password, passwordConfirmation } = this.form.value

        if (!this.form.valid || password !== passwordConfirmation) {
            this.alertService.error('Passwords do not match')
            return
        }

        this.authApiService
            .resetPassword(
                this.activeRoute.snapshot.params['token'],
                this.userInfo.email,
                password,
            )
            .subscribe((res) => {
                this.alertService.success('Password reset successfully...')
                setTimeout(() => {
                    this.router.navigateByUrl(`/${getAuthRoutes().login.path}`)
                }, 3000)
            })
    }
}
