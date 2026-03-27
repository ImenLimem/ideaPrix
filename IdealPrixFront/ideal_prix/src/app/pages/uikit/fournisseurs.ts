import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import {ObjectUtils} from "primeng/utils";
import { Fournisseur } from '@/models/Fournisseurs';
import { FournisseurService } from '@/service/fournisseurs.service';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { CustomerService } from '@/service/customer.service';
import { ProductService } from '@/service/product.service';


interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-table-demo',
    standalone: true,
    imports: [
    
        TableModule,
        MultiSelectModule,
        SelectModule,
        InputIconModule,
        TagModule,
        InputTextModule,
        SliderModule,
        ProgressBarModule,
        ToggleButtonModule,
        ToastModule,
        CommonModule,
        FormsModule,
        ButtonModule,
        RatingModule,
        RippleModule,
        IconFieldModule,
        DialogModule,
        ReactiveFormsModule,
        FloatLabelModule,
        MessageModule
    ],
    template: ` 
        <p-toast position="bottom-center"></p-toast>
        <div class="card" style="width: 100%; height: 100vh; overflow: auto;">
            <h1 class="text-3xl font-semibold text-gray-800">Fournisseurs</h1>

            <div class="flex justify-between items-center mb-5">

               <div class="flex items-center gap-4 mb-6 w-full">
    
                <div class="flex items-center justify-center gap-3 flex-1 ml-40"> 
                    <label class="font-medium text-gray-700 whitespace-nowrap">Recherche fournisseur :</label>
                    <p-iconfield iconPosition="left">
                        <p-inputicon styleClass="pi pi-search"></p-inputicon>
                        <input pInputText type="text" placeholder="Recherche par nom, prénom, pays, téléphone ou banque" [(ngModel)]="searchTerm"
                        (keyup)="onSearch()" class="w-130" />
                    </p-iconfield>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        pButton
                        label="Ajouter"
                        icon="pi pi-plus"
                        class="p-button-danger mr-2" 
                        (click)="openAddFournisseurDialog()">
                    </button>

                    <button
                        pButton
                        label="Exporter Excel"
                        icon="pi pi-file-excel"
                        class="p-button-success"
                        (click)="exportToExcel()">
                    </button>
                </div>

            </div>
       
    </div>



               

    <p-table [value]="fournisseurs"  [tableStyle]="{ 'width': '90%', 'margin': '0 auto' }">
        <!-- HEADER -->
        <ng-template pTemplate="header">
            <tr>
                    <th>Nom & Prénom</th>
                <th>Pays</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Site</th>
                <th>Actions</th>
            </tr>
        </ng-template>

        <!-- BODY -->
        <ng-template pTemplate="body" let-fournisseur>
                <tr>
                    <td>{{ fournisseur.nom }} {{ fournisseur.prenom }}</td>
                    <td>
                        <div class="flex items-center gap-2">
                            <img
                            *ngIf="getFlagUrl(fournisseur.pays)"
                            [src]="getFlagUrl(fournisseur.pays)"
                            alt="{{ fournisseur.pays }}"
                            width="28"
                            height="20"
                            style="object-fit: cover; border-radius: 3px;"
                            />
                            <span>{{ fournisseur.pays }}</span>
                        </div>
                        </td>


                    <td>{{ fournisseur.tel }}</td>
                    <td>{{ fournisseur.email }}</td>

                    <!-- SITE WEB (icône) -->
                    <td class="text-center">
                        <a *ngIf="fournisseur.siteWeb"
                        [href]="fournisseur.siteWeb"
                        target="_blank"
                        class="no-underline">
                        <button 
                                pButton 
                                pRipple 
                                type="button" 
                                icon="pi pi-globe" 
                                class="p-button-rounded p-button-text p-button-info custom-globe-btn"
                                pTooltip="Consulter le site" 
                                tooltipPosition="top">
                        </button>
                        </a>
                        <span *ngIf="!fournisseur.siteWeb" class="text-gray-400 text-sm">-</span>
                    </td>

                    <!-- ACTIONS -->
                    <!-- ACTIONS -->
                        <td>
                        <div class="flex items-center gap-2">
                            <!-- Voir (eye) -->
                            <button
                                pButton
                                icon="pi pi-eye"
                                class="p-button-rounded p-button-text"
                                style="color: orange;"
                                pTooltip="Voir articles"
                                tooltipPosition="top"
                                (click)="showArticles(fournisseur.id)">
                            </button>

                            <!-- Modifier (edit/pencil) -->
                            <button
                                pButton
                                icon="pi pi-pencil"
                                class="p-button-rounded p-button-text p-button-warning"
                                pTooltip="Modifier fournisseur"
                                tooltipPosition="top"
                                (click)="openEditFournisseurDialog(fournisseur)">
                            </button>

                            <!-- Supprimer (trash) -->
                            <!--<button
                                pButton
                                icon="pi pi-trash"
                                class="p-button-rounded p-button-text p-button-danger"
                                pTooltip="Supprimer fournisseur"
                                tooltipPosition="top"
                                (click)="openDeleteFournisseurDialog(fournisseur)">
                            </button>-->
                        </div>
                        </td>
                </tr>
            </ng-template>
    </p-table>
</div>
<!--Modal d'ajout -->
<p-dialog [(visible)]="displayAddFournisseurDialog"
          [modal]="true"
          [closable]="false"
          header="Ajouter un Fournisseur"
          [style]="{'width': '80%', 'height': 'auto', 'max-width': '800px'}">

  <form [formGroup]="fournisseurForm" (ngSubmit)="onSubmitAdd()" class="p-fluid">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">

      <!-- COLONNE 1 -->
        <div class="flex flex-col gap-6 w-full">
        <p-floatlabel>
            <input pInputText id="nom" formControlName="nom" class="w-full" />
            <label for="nom">Nom</label>
        </p-floatlabel>

        <p-floatlabel>
            <input pInputText id="prenom" formControlName="prenom" class="w-full" />
            <label for="prenom">Prénom</label>
        </p-floatlabel>

         <p-floatlabel>
            <input pInputText id="adresse" formControlName="adresse" class="w-full" />
            <label for="adresse">Adresse</label>
        </p-floatlabel>

        <!--<p-floatlabel>
            <input pInputText id="pays" formControlName="pays" class="w-full" />
            <label for="pays">Pays</label>
        </p-floatlabel>-->

     <div class="autocomplete-wrapper">
        <p-floatlabel>
            <input pInputText
                id="pays"
                formControlName="pays"
                (input)="filterCountries($event, 'pays')"
                autocomplete="off" />
            <label for="pays">Pays</label>
        </p-floatlabel>

        <!-- liste filtrée -->
        <ul *ngIf="filteredCountriesPays.length > 0" class="autocomplete-suggestions">
            <li *ngFor="let country of filteredCountriesPays"
                (click)="selectCountry(country, 'pays')">
            {{ country[0] }}
            </li>
        </ul>
        </div>


        <p-floatlabel>
            <input pInputText id="tel" formControlName="tel" class="w-full" />
            <label for="tel">Téléphone</label>
        </p-floatlabel>

        <p-floatlabel>
            <input pInputText id="email" formControlName="email" class="w-full" />
            <label for="email">Email</label>
        </p-floatlabel>

        <p-floatlabel>
            <input pInputText id="siteWeb" formControlName="siteWeb" class="w-full" />
            <label for="siteWeb">Site Web</label>
        </p-floatlabel>
        </div>

        <!-- COLONNE 2 -->
        <div class="flex flex-col gap-6 w-full">
        <p-floatlabel>
            <input pInputText id="nomBanque" formControlName="nomBanque" class="w-full" />
            <label for="nomBanque">Nom Banque</label>
        </p-floatlabel> 

        <p-floatlabel>
            <input pInputText id="adresseBanque" formControlName="adresseBanque" class="w-full" />
            <label for="adresseBanque">Adresse Banque</label>
        </p-floatlabel>

        <p-floatlabel>
            <input pInputText id="brancheBanque" formControlName="brancheBanque" class="w-full" />
            <label for="brancheBanque">Branche Banque</label>
        </p-floatlabel>

         <div class="autocomplete-wrapper" style="margin-top: 1rem;">
            <p-floatlabel>
                <input pInputText
                    id="paysBanque"
                    formControlName="paysBanque"
                    (input)="filterCountries($event, 'paysBanque')"
                    autocomplete="off" />
                <label for="paysBanque">Pays Banque</label>
            </p-floatlabel>

            <ul *ngIf="filteredCountriesBanque.length > 0" class="autocomplete-suggestions">
                <li *ngFor="let country of filteredCountriesBanque"
                    (click)="selectCountry(country, 'paysBanque')">
                {{ country[0] }}
                </li>
            </ul>
            </div>


        <p-floatlabel>
            <input pInputText id="rib" formControlName="rib" class="w-full" />
            <label for="rib">RIB</label>
        </p-floatlabel>

        <p-floatlabel>
            <input pInputText id="swiftCode" formControlName="swiftCode" class="w-full" />
            <label for="swiftCode">Swift Banque</label>
        </p-floatlabel>
        
        </div>


    </div>

    <!-- BOUTONS EN BAS -->
    <div class="flex justify-start mt-6 gap-3">
            <button pButton type="submit" label="Enregistrer" icon="pi pi-check" 
                    class="p-button-danger" 
                    [disabled]="fournisseurForm.invalid">
            </button>

      <button pButton type="button" label="Annuler" icon="pi pi-times" class="p-button-secondary" (click)="closeAddFournisseurDialog()"></button>
    </div>

  </form>
</p-dialog>

<!--dialog de modificatioon -->
<p-dialog [(visible)]="displayFournisseurDialog"
          [modal]="true"
          [closable]="false"
          [header]="isEditMode ? 'Modifier Fournisseur' : 'Ajouter Fournisseur'"
          [style]="{'width': '80%', 'height': 'auto', 'max-width': '800px'}">

  <form [formGroup]="fournisseurForm" (ngSubmit)="onSubmitModify()" class="p-fluid">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">

      <!-- COLONNE 1 -->
        <div class="flex flex-col gap-6 w-full"> <!-- gap-6 au lieu de gap-4 -->
        <p-floatlabel>
            <input pInputText id="nom" formControlName="nom" class="w-full" />
            <label for="nom">Nom</label>
        </p-floatlabel>

        <p-floatlabel>
            <input pInputText id="prenom" formControlName="prenom" class="w-full" />
            <label for="prenom">Prénom</label>
        </p-floatlabel>

        <p-floatlabel>
            <input pInputText id="adresse" formControlName="adresse" class="w-full" />
            <label for="adresse">Adresse</label>
        </p-floatlabel>

        
        <!-- INPUT Pays filtrable -->
        <div class="autocomplete-wrapper">
          <p-floatlabel>
            <input pInputText
                   id="pays"
                   formControlName="pays"
                   (input)="filterCountries($event, 'pays')"
                   autocomplete="off" />
            <label for="pays">Pays</label>
          </p-floatlabel>

          <ul *ngIf="filteredCountriesPays.length > 0" class="autocomplete-suggestions">
            <li *ngFor="let country of filteredCountriesPays"
                (click)="selectCountry(country, 'pays')">
              {{ country[0] }}
            </li>
          </ul>
        </div>

        <p-floatlabel>
            <input pInputText id="tel" formControlName="tel" class="w-full" />
            <label for="tel">Téléphone</label>
        </p-floatlabel>

        <p-floatlabel>
            <input pInputText id="email" formControlName="email" class="w-full" />
            <label for="email">Email</label>
        </p-floatlabel>

        <p-floatlabel>
            <input pInputText id="siteWeb" formControlName="siteWeb" class="w-full" />
            <label for="siteWeb">Site Web</label>
        </p-floatlabel>
        </div>

        <!-- COLONNE 2 -->
        <div class="flex flex-col gap-6 w-full"> <!-- gap-6 au lieu de gap-4 -->
        

        <p-floatlabel>
            <input pInputText id="nomBanque" formControlName="nomBanque" class="w-full" />
            <label for="nomBanque">Nom Banque</label>
        </p-floatlabel>

         <p-floatlabel>
            <input pInputText id="adresseBanque" formControlName="adresseBanque" class="w-full" />
            <label for="adresseBanque">Adresse Banque</label>
        </p-floatlabel>

        <p-floatlabel>
            <input pInputText id="brancheBanque" formControlName="brancheBanque" class="w-full" />
            <label for="brancheBanque">Branche Banque</label>
        </p-floatlabel>

        <!-- INPUT Pays Banque filtrable -->
        <div class="autocomplete-wrapper" style="margin-top: 1rem;">
          <p-floatlabel>
            <input pInputText
                   id="paysBanque"
                   formControlName="paysBanque"
                   (input)="filterCountries($event, 'paysBanque')"
                   autocomplete="off" />
            <label for="paysBanque">Pays Banque</label>
          </p-floatlabel>

          <ul *ngIf="filteredCountriesBanque.length > 0" class="autocomplete-suggestions">
            <li *ngFor="let country of filteredCountriesBanque"
                (click)="selectCountry(country, 'paysBanque')">
              {{ country[0] }}
            </li>
          </ul>
        </div>


        <p-floatlabel>
            <input pInputText id="rib" formControlName="rib" class="w-full" />
            <label for="rib">RIB</label>
        </p-floatlabel>

        <p-floatlabel>
            <input pInputText id="swiftCode" formControlName="swiftCode" class="w-full" />
            <label for="swiftCode">Swift Code</label>
        </p-floatlabel>

        
        </div>

    </div>

    <!-- BOUTONS EN BAS -->
    <div class="flex justify-start mt-6 gap-3">
      <button pButton type="submit" label="Enregistrer" icon="pi pi-check" class="p-button-danger" [disabled]="fournisseurForm.invalid"></button>
      <button pButton type="button" label="Annuler" icon="pi pi-times" class="p-button-secondary" (click)="closeFournisseurDialog()"></button>
    </div>

  </form>
</p-dialog>

<!-- MODAL PROFIL FOURNISSEUR -->
    <p-dialog
    [(visible)]="displayDetailsDialog"
    header="Détails du Fournisseur"
    [modal]="true"
    [style]="{ width: '90%', 'max-width': '1100px' }"
    styleClass="supplier-details-dialog"
    (onHide)="selectedFournisseur = null">

  

      <!-- =================== INFOS FOURNISSEUR =================== -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

    <!-- 🧑‍💼 PROFIL FOURNISSEUR -->
    <div class="p-6 rounded-xl shadow-md bg-gradient-to-br from-red-50 to-white border border-red-200">
        <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center text-3xl font-bold">
                {{ selectedFournisseur?.nom?.charAt(0) }}
            </div>

            <div>
                <h2 class="text-2xl font-bold text-gray-800">
                    {{ selectedFournisseur?.nom }} {{ selectedFournisseur?.prenom }}
                </h2>
                


                <p class="text-sm text-gray-500 flex items-center gap-2">
                    <!--<i class="pi pi-map-marker"></i>-->
                    <img
                        *ngIf="getFlagUrl(selectedFournisseur?.pays || '')"
                        [src]="getFlagUrl(selectedFournisseur?.pays || '')"
                        alt="{{ selectedFournisseur?.pays }}"
                        class="w-5 h-3 object-cover rounded-sm"
                    />
                    <span>{{ selectedFournisseur?.pays }}</span>
                    </p>

            </div>
        </div>

        <div class="space-y-3 text-gray-700 text-lg">
            <p><i class="pi pi-home mr-2 text-red-500"></i><strong>Adresse :</strong> {{ selectedFournisseur?.adresse }}</p>
            <p><i class="pi pi-phone mr-2 text-green-500"></i><strong>Téléphone :</strong> {{ selectedFournisseur?.tel }}</p>
            <p><i class="pi pi-envelope mr-2 text-blue-500"></i><strong>Email :</strong> {{ selectedFournisseur?.email }}</p>

            <p class="flex items-center">
                <i class="pi pi-globe mr-2 text-purple-500"></i>
                <strong>Site Web :</strong>
                <a *ngIf="selectedFournisseur?.siteWeb"
                   [href]="selectedFournisseur?.siteWeb"
                   target="_blank"
                   class="ml-2 text-blue-600 underline hover:text-blue-800">
                    Visiter
                </a>
                <span *ngIf="!selectedFournisseur?.siteWeb" class="ml-2 text-gray-400">-</span>
            </p>
        </div>
    </div>

    <!-- 🏦 INFOS BANCAIRES -->
    <div class="p-6 rounded-xl shadow-md bg-gradient-to-br from-blue-50 to-white border border-blue-200">
        <h3 class="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
            <i class="pi pi-building"></i> Informations Bancaires
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg text-gray-700">
            <p><strong>Banque :</strong> {{ selectedFournisseur?.nomBanque }}</p>
            <p><strong>Branche :</strong> {{ selectedFournisseur?.brancheBanque }}</p>
            <p><strong>Adresse :</strong> {{ selectedFournisseur?.adresseBanque }}</p>
            <p class="flex items-center gap-2">
                <strong>Pays :</strong>
                <img
                     *ngIf="getFlagUrl(selectedFournisseur?.paysBanque || '')"
                    [src]="getFlagUrl(selectedFournisseur?.paysBanque || '')"
                    alt="{{ selectedFournisseur?.paysBanque }}"
                    class="w-5 h-3 object-cover rounded-sm"
                />
                <span>{{ selectedFournisseur?.paysBanque }}</span>
                </p>

            <p class="col-span-2"><strong>RIB :</strong> {{ selectedFournisseur?.rib }}</p>
            <p class="col-span-2"><strong>Swift :</strong> {{ selectedFournisseur?.swiftCode }}</p>
        </div>
    </div>

</div>


 <!-- TABLE ARTICLES -->
        <div class="mt-5">
        <h3 class="text-lg font-semibold mb-3">
            <i class="pi pi-box mr-2"></i> Articles associés
        </h3>

        <!-- LOADING -->
        <p-progressBar *ngIf="loadingArticles" mode="indeterminate"></p-progressBar>

        <!-- AUCUN ARTICLE -->
        <p-message
            *ngIf="!loadingArticles && articlesFournisseur.length === 0"
            severity="info"
            text="Aucun article associé à ce fournisseur">
        </p-message>

        <!-- TABLE ARTICLES -->
        <p-table
            *ngIf="articlesFournisseur.length > 0"
            [value]="articlesFournisseur"
            [paginator]="true"
            [rows]="5"
            [tableStyle]="{ width: '100%' }"
            responsiveLayout="scroll">

            <ng-template pTemplate="header">
            <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Code</th>
                <th>Famille</th>
                <th>Prix Achat</th>
                <th>Prix Vente</th>
            </tr>
            </ng-template>

            <ng-template pTemplate="body" let-article>
            <tr>
                <!-- IMAGE -->
               <td class="text-center">
                    <img *ngIf="article.image"
                    [src]="getImageUrl(article.image)"
                    alt="{{ article.nom }}"
                    style="
                        width: 60px;
                        height: 60px;
                        object-fit: contain;
                        display: block;
                        margin: auto;
                        border-radius: 4px;
                        
                    ">
                    <span *ngIf="!article.image">-</span>
                </td>


                <!-- AUTRES INFOS -->
                <td>{{ article.nom }}</td>
                <td>{{ article.code }}</td>
                <td>{{ article.famille || '-' }}</td>
                <td>{{ article.prixAchat | number:'1.2-2' }}</td>
                <td>{{ article.prixVente | number:'1.2-2' }}</td>
            </tr>
            </ng-template>

        </p-table>
        </div>
</p-dialog>

<p-dialog
  [(visible)]="displayDeleteFournisseurDialog"
  [modal]="true"
  [closable]="false"
  header="Confirmation de suppression"
  [style]="{ width: '450px' }">

  <div class="text-lg mb-4">
    Voulez-vous vraiment supprimer le fournisseur :
  </div>

  <div class="text-xl font-semibold text-red-600 mb-6">
    {{ fournisseurToDelete?.nom }} {{ fournisseurToDelete?.prenom }}
  </div>

  <div class="flex justify-end gap-3">
    <!-- ANNULER -->
    <button
      pButton
      type="button"
      label="Annuler"
      icon="pi pi-times"
      class="p-button-secondary"
      (click)="displayDeleteFournisseurDialog = false">
    </button>

    <!-- SUPPRIMER -->
    <button
      pButton
      type="button"
      label="Supprimer"
      icon="pi pi-trash"
      class="p-button-danger"
      (click)="confirmDeleteFournisseur(fournisseurToDelete!)">
    </button>
  </div>

</p-dialog>



`,
    styles: `
        .p-datatable-frozen-tbody {
            font-weight: bold;
        }

        .p-datatable-scrollable .p-frozen-column {
            font-weight: bold;
        }.autocomplete-wrapper {
            position: relative;
        }

        .autocomplete-suggestions {
            border: 1px solid #ccc;
            max-height: 150px;
            overflow-y: auto;
            background: white;
            padding: 0;
            margin: 0;
            list-style-type: none;
            position: absolute;
            width: 100%;
            z-index: 1000;
        }

        .autocomplete-suggestions li {
            padding: 8px;
            cursor: pointer;
        }

        .autocomplete-suggestions li:hover {
            background-color: #f0f0f0;
        }
    `,
    providers: [ConfirmationService, MessageService, CustomerService, ProductService]
})
export class Fournisseurs implements OnInit {

   fournisseurs: Fournisseur[] = []; 
    loading: boolean = true;
    displayAddFournisseurDialog: boolean = false;
    fournisseurForm!: FormGroup;
     displayFournisseurDialog: boolean = false;
    isEditMode: boolean = false;
    currentFournisseurId: number | null = null;
    displayDeleteFournisseurDialog: boolean = false;
    fournisseurToDelete: Fournisseur | null = null;
    searchTerm: string = '';  
    displayDetailsDialog: boolean = false;
    selectedFournisseur: Fournisseur | null = null;
    articlesFournisseur: any[] = [];
    loadingArticles: boolean = false;

      countries: [string, string][] = [
  ['tunisie', 'tn'],
  ['maroc', 'ma'],
  ['algérie', 'dz'],
  ['lybie', 'ly'],
  ['egypte', 'eg'],
  ['soudan', 'sd'],
  ['jordanie', 'jo'],
  ['liban', 'lb'],
  ['irak', 'iq'],
  ['syrie', 'sy'],
  ['émirats arabes unis', 'ae'],
  ['koweït', 'kw'],
  ['omman', 'om'],
  ['qatar', 'qa'],
  ['bahreïn', 'bh'],
  ['yémen', 'ye'],
  ['france', 'fr'],
  ['italie', 'it'],
  ['espagne', 'es'],
  ['allemagne', 'de'],
  ['royaume-uni', 'gb'],
  ['portugal', 'pt'],
  ['grèce', 'gr'],
  ['pays-bas', 'nl'],
  ['belgique', 'be'],
  ['suisse', 'ch'],
  ['autriche', 'at'],
  ['suède', 'se'],
  ['norvège', 'no'],
  ['finlande', 'fi'],
  ['danemark', 'dk'],
  ['irlande', 'ie'],
  ['pologne', 'pl'],
  ['hongrie', 'hu'],
  ['république tchèque', 'cz'],
  ['turquie', 'tr']
];

    filteredCountries: [string, string][] = [];
    filteredCountriesBanque: [string, string][] = [];
    filteredCountriesPays: [string, string][] = [];

    @ViewChild('filter') filter!: ElementRef;
    @ViewChild('dt') dt!: Table;

    constructor(
        private fournisseurService: FournisseurService,
          private fb: FormBuilder,
           private cd: ChangeDetectorRef,
           private messageService: MessageService 
    ) {}


    ngOnInit() {
        this.initFournisseurForm();
    this.fournisseurForm = this.fb.group({
         id: [null], // <--- ajouter pour la modification
        nom: ['', Validators.required],
        prenom: ['', Validators.required],
        adresse: ['', Validators.required],
        pays: ['', Validators.required],
        tel: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]], // ajoute validation email
        siteWeb: [''], // NON obligatoire
        nomBanque: ['', Validators.required],
        adresseBanque: ['', Validators.required],  
        brancheBanque: ['', Validators.required],   
        paysBanque: ['', Validators.required],      
        rib: ['', Validators.required],
        swiftCode: ['', Validators.required],       
    });

    this.loadFournisseurs();
    }
    private initFournisseurForm() {
    this.fournisseurForm = this.fb.group({
        id: [null], // important pour l'édition
        nom: ['', Validators.required],
        prenom: ['', Validators.required],
        adresse: ['', Validators.required],
        pays: ['', Validators.required],
        tel: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        siteWeb: [''],
        nomBanque: ['', Validators.required],
        adresseBanque: ['', Validators.required],
        brancheBanque: ['', Validators.required],
        paysBanque: ['', Validators.required],
        rib: ['', Validators.required],
        swiftCode: ['', Validators.required]
    });
}


    loadFournisseurs() {
        this.fournisseurService.getFournisseurs().subscribe({
            next: (data) => {
                this.fournisseurs = data;
                this.loading = false;
                console.log('Fournisseurs:', data);
            },
            error: (err) => {
                console.error('Erreur chargement fournisseurs', err);
                this.loading = false;
            }
        });
    }
     openAddFournisseurDialog() {
        this.fournisseurForm = this.fb.group({
            nom: [null],
            prenom: ['', Validators.required],
            adresse: ['', Validators.required],
            pays: ['', Validators.required],
            tel: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            siteWeb: [''], // NON obligatoire
            nomBanque: ['', Validators.required],
            adresseBanque: ['', Validators.required],
            brancheBanque: ['', Validators.required],
            rib: ['', Validators.required],
            swiftCode: ['', Validators.required],
            paysBanque: ['', Validators.required]
        });

        this.displayAddFournisseurDialog = true;
        }

    onSubmitAdd() {
  if (this.fournisseurForm.invalid) return; // Si le formulaire n'est pas valide, on arrête

  const nouveauFournisseur: Fournisseur = this.fournisseurForm.value;

  this.fournisseurService.addFournisseur(nouveauFournisseur).subscribe({
    next: (res) => {
      console.log('Fournisseur ajouté', res);

      // Ferme le modal
      this.displayAddFournisseurDialog = false;

      // Recharge la liste des fournisseurs
      this.loadFournisseurs();
      
      // Optionnel : reset le formulaire pour un nouvel ajout futur
     this.initFournisseurForm(); 
       // 🔹 Message toast
        this.messageService.add({
            severity: 'success',
            summary: 'Ajout réussi',
            detail: `Le fournisseur "${res.nom}" a été ajouté.`
        });
    },
    error: (err) => {
      console.error('Erreur ajout fournisseur', err);
      this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Impossible d'ajouter le fournisseur. Vérifiez les champs.`
        });
      
    }
  });
}


    closeAddFournisseurDialog() {
        this.displayAddFournisseurDialog = false;
    }

        
    getImageUrl(imageName: string): string {
        if (!imageName) return ''; 
        return `http://localhost:8080/articles/images/${encodeURIComponent(imageName)}`;
    }


   

  // MODIFIER
 openEditFournisseurDialog(fournisseur: Fournisseur) {
  this.fournisseurForm.setValue({
     id: fournisseur.id, // <--- important
    nom: fournisseur.nom,
    prenom: fournisseur.prenom,
    pays: fournisseur.pays,
    adresse: fournisseur.adresse,
    tel: fournisseur.tel,
    email: fournisseur.email,
    nomBanque: fournisseur.nomBanque,
    adresseBanque: fournisseur.adresseBanque || '',
    brancheBanque: fournisseur.brancheBanque || '',
    paysBanque: fournisseur.paysBanque || '',
    rib: fournisseur.rib,
    swiftCode: fournisseur.swiftCode || '',
    siteWeb: fournisseur.siteWeb || ''
  });

  this.isEditMode = true;
  this.displayFournisseurDialog = true;
}

    closeFournisseurDialog() {
            this.displayFournisseurDialog = false;
        }
    onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
}
/*onSubmit() {
  if (this.fournisseurForm.valid) {
    const fournisseurData = this.fournisseurForm.value;

    if (this.isEditMode && this.currentFournisseurId != null) {
      const fournisseurToUpdate = {
        ...fournisseurData,
        id: this.currentFournisseurId
      };

      this.fournisseurService.updateFournisseur(fournisseurToUpdate).subscribe({
        next: () => {
          this.loadFournisseurs();
          this.closeFournisseurDialog();
        },
        error: (err) => console.error('Erreur modification fournisseur', err)
      });

    } else {
      // ADD
      this.fournisseurService.addFournisseur(fournisseurData).subscribe({
        next: () => {
          this.loadFournisseurs();
          this.closeFournisseurDialog();
        },
        error: (err) => console.error('Erreur ajout fournisseur', err)
      });
    }
  }
}*/

onSubmitModify() {
  if (this.fournisseurForm.invalid) return;

  const fournisseur: Fournisseur = this.fournisseurForm.value;

  if (this.isEditMode && fournisseur.id != null) {
    this.fournisseurService.updateFournisseur(fournisseur).subscribe({
      next: (res) => {
        console.log('Fournisseur modifié', res);
        this.displayFournisseurDialog = false;
        this.loadFournisseurs(); // recharge la liste
         this.messageService.add({
            severity: 'success',
            summary: 'Modification réussie',
            detail: `Le fournisseur "${res.nom}" a été modifié.`
        });
      },
      error: (err) => {
        console.error('Erreur modification fournisseur', err);
         this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Impossible de modifier le fournisseur "${fournisseur.nom}".`
        });
      }
    });
  }
}
openDeleteFournisseurDialog(fournisseur: Fournisseur) {
    this.fournisseurToDelete = fournisseur;
    this.displayDeleteFournisseurDialog = true;
}

// Confirme la suppression
// Confirme la suppression
confirmDeleteFournisseur(fournisseur: Fournisseur) {
  if (!fournisseur?.id) return;

  this.fournisseurService.deleteFournisseur(fournisseur.id).subscribe({
    next: () => {
      // Suppression OK
      this.fournisseurs = this.fournisseurs.filter(f => f.id !== fournisseur.id);
      this.displayDeleteFournisseurDialog = false;

      this.messageService.add({
        severity: 'success',
        summary: 'Suppression réussie',
        detail: `Le fournisseur "${fournisseur.nom}" a été supprimé.`
      });
    },

    error: (err) => {
      console.error('Erreur suppression fournisseur', err);

      // 🔴 CAS IMPORTANT : fournisseur possède des articles
      if (err.status === 409) {
        this.messageService.add({
          severity: 'error',
          summary: 'Suppression impossible',
          detail: `Le fournisseur "${fournisseur.nom}" possède des articles et ne peut pas être supprimé.`
        });
      }
      // Fournisseur non trouvé
      else if (err.status === 404) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Introuvable',
          detail: `Le fournisseur "${fournisseur.nom}" n'existe plus.`
        });
      }
      // Autre erreur
      else {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la suppression.'
        });
      }

      this.displayDeleteFournisseurDialog = false;
    }
  });
}

onSearch() {
    this.fournisseurService.searchFournisseur(this.searchTerm)
      .subscribe(data => {
        this.fournisseurs = data;
      });
  }

// 🔹 Nouvelle fonction pour afficher les articles d'un fournisseur
 

  showArticles(fournisseurId: number) {
  const fournisseur = this.fournisseurs.find(f => f.id === fournisseurId);
  if (!fournisseur) return;

  this.selectedFournisseur = fournisseur;
  this.loadingArticles = true;
  this.displayDetailsDialog = true;

  this.fournisseurService.getArticles(fournisseurId).subscribe({
    next: (articles) => {
         console.log(`Articles du fournisseur ${fournisseurId}:`, articles);
      this.articlesFournisseur = articles;
      this.loadingArticles = false;
    },
    error: (err) => {
      console.error('Erreur chargement articles', err);
      
        /*this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
           detail: `Impossible de supprimer  le fournisseur "${fournisseur.nom}" : il possède des articles.`
        });*/
      this.articlesFournisseur = [];
      this.loadingArticles = false;
    }
  });
}
exportToExcel() {
  if (!this.fournisseurs || this.fournisseurs.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Aucun fournisseur',
      detail: 'La liste des fournisseurs est vide.'
    });
    return;
  }

  // Préparer les données
  const dataToExport = this.fournisseurs.map(f => ({
    Nom: f.nom,
    Prénom: f.prenom,
    Adresse: f.adresse,
    Pays: f.pays,
    Téléphone: f.tel,
    Email: f.email,
    SiteWeb: f.siteWeb || '-',
    'Nom Banque': f.nomBanque,
    'Adresse Banque': f.adresseBanque,
    'Branche Banque': f.brancheBanque,
    'Pays Banque': f.paysBanque,
    RIB: f.rib,
    'Swift Code': f.swiftCode
  }));

  // Créer un workbook
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Fournisseurs');

  // Exporter le fichier
  const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'Liste_Fournisseurs.xlsx');
}

getCountryCode(pays: string): string {
  if (!pays) return '';

  const countries: [string, string][] = [
  // Pays arabes
  ['tunisie', 'tn'],
  ['maroc', 'ma'],
  ['algérie', 'dz'],
  ['lybie', 'ly'],
  ['egypte', 'eg'],
  ['soudan', 'sd'],
  ['jordanie', 'jo'],
  ['liban', 'lb'],
  ['irak', 'iq'],
  ['syrie', 'sy'],
  ['émirats arabes unis', 'ae'],
  ['koweït', 'kw'],
  ['omman', 'om'],
  ['qatar', 'qa'],
  ['bahreïn', 'bh'],
  ['yémen', 'ye'],
  // Pays européens
  ['france', 'fr'],
  ['italie', 'it'],
  ['espagne', 'es'],
  ['allemagne', 'de'],
  ['royaume-uni', 'gb'],
  ['portugal', 'pt'],
  ['grèce', 'gr'],
  ['pays-bas', 'nl'],
  ['belgique', 'be'],
  ['suisse', 'ch'],
  ['autriche', 'at'],
  ['suède', 'se'],
  ['norvège', 'no'],
  ['finlande', 'fi'],
  ['danemark', 'dk'],
  ['irlande', 'ie'],
  ['pologne', 'pl'],
  ['hongrie', 'hu'],
  ['république tchèque', 'cz'],
  ['turquie', 'tr'] // <-- ajouté ici
];

// Création automatique du map
const map: { [key: string]: string } = {};
countries.forEach(([name, code]) => {
  map[name.toLowerCase()] = code;
});

console.log(map);

  return map[pays.toLowerCase()] || '';
}

getFlagUrl(pays: string): string {
  const code = this.getCountryCode(pays);
  return code ? `https://flagcdn.com/w40/${code}.png` : '';
}
// Fonction de filtrage unique pour les deux champs
filterCountries(event: any, controlName: string) {
    const query = event.target.value.toLowerCase();
    const filtered = this.countries.filter(
        ([name, code]) => name.toLowerCase().includes(query)
    );

    if (controlName === 'pays') {
        this.filteredCountriesPays = filtered;
    } else if (controlName === 'paysBanque') {
        this.filteredCountriesBanque = filtered;
    }
}

// Sélectionner un pays
selectCountry(country: [string, string], controlName: string) {
    this.fournisseurForm.controls[controlName].setValue(country[0]);
    if (controlName === 'pays') {
        this.filteredCountriesPays = [];
    } else if (controlName === 'paysBanque') {
        this.filteredCountriesBanque = [];
    }
}

}