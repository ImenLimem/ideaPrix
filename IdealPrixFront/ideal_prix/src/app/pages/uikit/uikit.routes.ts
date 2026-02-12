import { Routes } from '@angular/router';
import { Articles } from './articles';
import { Fournisseurs } from './fournisseurs';
import { BonDeCommande } from './bonDeCommande';


export default [
   
     { path: 'articles', data: { breadcrumb: 'Article' }, component: Articles },
    { path: 'fournisseurs', data: { breadcrumb: 'Fournisseurs' }, component: Fournisseurs},
     { path: 'bonsDeCommande', data: { breadcrumb: 'BonDeCommande' }, component: BonDeCommande },
    { path: '**', redirectTo: '/notfound' },
   
] as Routes;
