import { HttpClient } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import {
    APP_EXAMPLE_ENVIRONMENT,
    AppExampleEnvironment,
} from '@my-nx-starter/app-example-core'
import { ApiService } from '@my-nx-starter/common-services'
import {
    User,
    UserDto,
    UserPermissions,
} from '@my-nx-starter/app-example-models'
import { ApiResponse } from '@my-nx-starter/common-models'

@Injectable({
    providedIn: 'root',
})
export class UserApiService extends ApiService<User, UserDto> {
    constructor(
        protected override http: HttpClient,
        @Inject(APP_EXAMPLE_ENVIRONMENT)
        private env: AppExampleEnvironment,
    ) {
        super(http, `${env.apiUrl}/v1/users`)
    }

    getUnapprovedUsers(
        organizationId: string,
    ): Observable<ApiResponse<User[]>> {
        return this.find({ organizationId, isApproved: false })
    }

    setPermissions(
        id: string,
        permissions: UserPermissions,
    ): Observable<ApiResponse<User>> {
        return this.http.patch<ApiResponse<User>>(
            `${this.apiUrl}/${id}/permissions`,
            {
                ...permissions,
            },
        )
    }

    changeRole(id: string, role: string): Observable<ApiResponse<User>> {
        return this.http.patch<ApiResponse<User>>(
            `${this.apiUrl}/${id}/change-role`,
            {
                role,
            },
        )
    }
}
