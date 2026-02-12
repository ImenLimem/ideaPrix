import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule ,HttpClientModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {}
