import { Injectable } from '@angular/core'
import { ReleaseNoteApiService } from '@myorg/app-example-api-services'
import { AlertService } from '@myorg/app-example-core'
import { ReleaseNote } from '@myorg/app-example-models'
import { SimpleStore } from '@myorg/store'
import { shake } from 'radash'
import { combineLatest, debounceTime, switchMap, tap } from 'rxjs'

const PAGE_SIZE = 24

export interface ReleaseNoteListState {
    releaseNote: ReleaseNote[]
    loading: boolean
    totalPages: number
    totalResults: number
    searchTerm: string
    page: number
    pageSize: number
}

const initialReleaseNoteListState: ReleaseNoteListState = {
    releaseNote: [],
    loading: false,
    totalPages: 1,
    totalResults: 0,
    searchTerm: '',
    page: 1,
    pageSize: PAGE_SIZE,
}

@Injectable({
    providedIn: 'root',
})
export class ReleaseNoteListStateService extends SimpleStore<ReleaseNoteListState> {
    constructor(
        private releaseNoteApiService: ReleaseNoteApiService,
        private alertService: AlertService,
    ) {
        super(initialReleaseNoteListState)
        this.init()
    }

    init() {
        this.continueLoadingReleaseNote()
        this.continueResetingStateOnSearchTermChange()
    }

    private continueLoadingReleaseNote() {
        combineLatest([this.select('page'), this.select('pageSize'), this.select('searchTerm')])
            .pipe(
                debounceTime(300),
                tap(() => this.setState({ loading: true })),
                switchMap(([currentPage, pageSize, search]) => {
                    return this.releaseNoteApiService.find(
                        shake({
                            page: currentPage,
                            search,
                            size: pageSize,
                            sortBy: 'createdAt',
                            orderBy: 'desc',
                        }),
                    )
                }),
            )
            .subscribe({
                next: (data) => {
                    this.setState({
                        releaseNote: data.data,
                        loading: false,
                        totalResults: data.meta?.total,
                        totalPages: Math.ceil(data.meta?.total ?? 0 / PAGE_SIZE),
                    })
                },
                error: (error) => {
                    this.alertService.error(error.message)
                    this.setState({ loading: false })
                },
            })
    }

    // when search term or filters change, reset pagination in order to fetch new contents
    private continueResetingStateOnSearchTermChange() {
        combineLatest([this.select('searchTerm')]).subscribe({
            next: () => {
                this.setState({
                    page: 1,
                    pageSize: PAGE_SIZE,
                    totalPages: 1,
                    totalResults: 0,
                    releaseNote: [],
                })
            },
        })
    }
}
