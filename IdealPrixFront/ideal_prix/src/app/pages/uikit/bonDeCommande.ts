import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, Input, Output, EventEmitter, ViewChild, ElementRef, LOCALE_ID } from '@angular/core';
import { BonDeCommandeService } from '@/service/bonDeCommande.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table'; 
import { ToastModule } from 'primeng/toast'; 
import { ButtonModule } from 'primeng/button'; 
import { CommonModule, formatDate } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ArticleCommande, BonDeCommandeArticle } from '@/models/BonDeCommande';
import { AutoCompleteModule } from 'primeng/autocomplete';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Article } from '@/models/Article';



@Component({
  selector: 'app-bon-de-commande',
  standalone: true,
  imports: [
    TableModule,
    MultiSelectModule,
    SelectModule,
    InputIconModule,
    TagModule,
    SliderModule,
    ProgressBarModule,
    ToggleButtonModule,
    ToastModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    ReactiveFormsModule,
    DialogModule,           
    InputTextModule,
    TooltipModule,
    AutoCompleteModule
  ],
  schemas: [//CUSTOM_ELEMENTS_SCHEMA
  ],
   
  template: `
 <p-toast position="bottom-center"></p-toast>
<div class="card" style="width: 100%; height: 100vh; overflow: auto; padding: 2rem;">

  <!-- Header avec titre et boutons -->
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-semibold text-gray-800">Liste des Bons de Commande</h1>
    <div class="flex gap-3">
      <button
        pButton
        label="Ajouter"
        icon="pi pi-plus"
        class="p-button-rounded p-button-primary"
        (click)="openAddCommandeDialog()"
      ></button>
      <!--<button pButton label="Télécharger liste des prix" icon="pi pi-file-excel" class="p-button-rounded p-button-success"></button>-->
    </div>
  </div>

  <!-- Champ de recherche avec titre -->
  <div class="flex justify-center mb-10 items-center gap-4">
    <span class="text-lg font-medium text-gray-700">Recherche de Bon de Commande :</span>
    <div class="w-96"> <!-- largeur fixe du champ -->
      <p-inputIcon icon="pi pi-search" position="left">
        <input
          pInputText
          type="text"
          class="w-full"
          [value]="searchQuery"
          (input)="onSearch($event)"
          placeholder="Rechercher par numéro de commande"
        />
      </p-inputIcon>
    </div>
  </div>

  <!-- Table des commandes avec tri sur certaines colonnes -->
<p-table
  [value]="filteredBonDeCommandes()"
  [paginator]="true"
  [rows]="20"
  [totalRecords]="bonDeCommandes.length"
  [rowsPerPageOptions]="[30, 50, 100]"
  class="p-datatable-gridlines"
>
  <ng-template pTemplate="header">
    <tr>
      <th>Numéro</th>
      <th>Fournisseur</th>
       <th>Total ($)</th>

      <!-- Colonnes de dates avec tri -->
      <th pSortableColumn="dateCommande">
        Date Commande
        <i class="pi pi-sort" style="margin-left: 0.5rem;"></i>
      </th>
      <th pSortableColumn="dateLivraison">
        Date Livraison
        <i class="pi pi-sort" style="margin-left: 0.5rem;"></i>
      </th>
      <th pSortableColumn="dateExpedition">
        Date Expedition
        <i class="pi pi-sort" style="margin-left: 0.5rem;"></i>
      </th>

      <th>Status</th>
      <th>Actions</th>
    </tr>
  </ng-template>

  <ng-template pTemplate="body" let-commande>
    <tr>
      <td>{{ commande.numeroBonCommande }}</td>
      <td>{{ commande.fournisseur.nom }} {{ commande.fournisseur.prenom }}</td>
      <td>
        <strong>
         {{ getTotalBonCommande(commande) | number:'1.2-2' }} $

        </strong>
      </td>


      <td class="date-commande">{{ commande.dateCommande | date:'dd/MM/yyyy' }}</td>
      <td class="date-livraison">{{ commande.dateLivraison | date:'dd/MM/yyyy' }}</td>
      <td class="date-expedition">{{ commande.dateExpedition | date:'dd/MM/yyyy' }}</td>

      <td>
       <span class="status-pill" [ngClass]="getStatusClass(updateStatutAffichage(commande))">
          {{ mapStatut(updateStatutAffichage(commande)) }}
        </span>

      </td>
      <td>
        <!-- Actions -->
        <button
          pButton
          type="button"
          icon="pi pi-pencil"
          class="edit-icon-btn"
          [disabled]="commande.statut === 'LIVRE' || commande.statut === 'TERMINE' || commande.statut === 'ENVOYE'"
          (click)="openEditModal(commande)"
          pTooltip="{{ commande.statut === 'LIVRE' || commande.statut === 'TERMINE' || commande.statut === 'ENVOYE' 
            ? 'Modification impossible (déjà envoyé, livré ou terminé)' 
            : 'Modifier le bon de commande' }}"
          tooltipPosition="top"
        ></button>

        <button
          pButton
          icon="pi pi-download"
          class="p-button-rounded p-button-success p-button-text"
          (click)="downloadCommande(commande)"
          pTooltip="Télécharger le bon de commande"
        ></button>

        <button
          pButton
          icon="pi pi-trash"
          class="p-button-rounded p-button-danger p-button-text"
          (click)="archiveCommande(commande)"
          pTooltip="Archiver"
        ></button>
      </td>
    </tr>
  </ng-template>
</p-table>


<!-- Modal d'ajout -->

<p-dialog
  header="Ajouter un Bon de Commande"
  [(visible)]="visibleAdd"
  [modal]="true"
  [closable]="true"
  [style]="{ width: '900px' }"
>

  <form [formGroup]="addForm" (ngSubmit)="submitAdd()">

    <!-- Numéro + Fournisseur -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="font-semibold">Numéro Bon de Commande</label>
        <input
          pInputText
          formControlName="numeroBonCommande"
          class="w-full"
          readonly
        />
      </div>

      <div>
        <label class="font-semibold">Fournisseur</label>
        <select class="w-full p-2 border rounded" formControlName="fournisseurId">
          <option *ngFor="let f of fournisseursOptions" [value]="f.id">{{ f.nomComplet }}</option>
        </select>
      </div>
    </div>

    <!-- Date de commande (readonly) -->
    <div class="mb-4">
      <label class="font-semibold">Date Bon de Commande</label>
      <input pInputText formControlName="dateCommande" readonly class="w-full" />
    </div>

    <!-- Description -->
    <div class="mb-4">
      <label class="font-semibold">Description</label>
      <input pInputText formControlName="description" class="w-full" />
    </div>

    <!-- Statut -->
    <div class="mb-4">
      <label class="font-semibold">Statut</label>
      <select class="w-full p-2 border rounded" formControlName="statut">
        <option *ngFor="let s of statutOptions" [value]="s.value">{{ s.label }}</option>
      </select>
    </div>

    <!-- Dates -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="font-semibold">Date d'expédition</label>
        <input type="date" class="w-full p-2 border rounded" formControlName="dateExpedition" />
      </div>

      <div>
        <label class="font-semibold">Date de livraison</label>
        <input type="date" class="w-full p-2 border rounded" formControlName="dateLivraison" />
      </div>
    </div>
    
    <!-- Articles -->
   <div class="flex justify-between items-center mb-2 gap-4">
        <h3 class="text-lg font-semibold">Articles</h3>

        <!-- Cours du Dollar -->
        <div class="flex flex-col w-40">
          <label class="font-semibold">Cours du Dollar (DT)</label>
          <input
            pInputText
            type="number"
            formControlName="prixDollar"
            class="w-full"
            min="0"
            step="0.01"
            (input)="calculateTotalTtc()"
            placeholder="Cours du jour"
          />
        </div>

        <!-- Bouton Ajouter un article -->
        <button pButton type="button" label="Ajouter un article" icon="pi pi-plus"
                class="p-button-sm p-button-primary"
                (click)="addEmptyArticleAdd()"></button>
      </div>


    <table class="p-datatable w-full border border-gray-300 rounded">
      <thead class="bg-gray-100">
        <tr>
          <th class="border p-2">Code</th>
          <th class="border p-2">Article</th>
          <th class="border p-2">Quantité</th>
          <th class="border p-2">Prix Achat</th>
          <th class="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody formArrayName="articles">
        <tr *ngFor="let item of articlesFormArrayAdd.controls; let i = index" [formGroupName]="i">
          <td class="border p-2">
            <p-autoComplete
              [suggestions]="filteredArticlesAdd[i]"
              (completeMethod)="filterArticlesAdd($event, i)"
              formControlName="articleObj"
              [dropdown]="true"
              (onSelect)="onArticleSelectedAdd($event, i)"
              optionLabel="code"
              dataKey="id"
              placeholder="Nom ou code"
              [forceSelection]="true">

              <ng-template pTemplate="item" let-article>
                {{ article.code }} - {{ article.nom }}
              </ng-template>

            </p-autoComplete>

          </td>

          <td class="border p-2">
            <input pInputText type="text" formControlName="nom" [readonly]="true" />
          </td>

          <td class="border p-2">
            <input type="number" pInputText formControlName="quantite" min="1" class="w-24 p-inputtext-sm" />
          </td>

          <td class="border p-2">
            {{ item.get('prixAchat')?.value | number:'1.2-2' }} DT
          </td>

          <td class="border p-2 flex gap-2">
            <button pButton type="button" icon="pi pi-trash" class="p-button-sm p-button-danger"
                    (click)="removeArticleAdd(i)"></button>
          </td>
        </tr>
      </tbody>
    </table>

  
    <!-- Total TTC -->
      <div class="flex justify-end mt-4">
        <div class="w-64">
          <label class="font-semibold">Total TTC</label>
          <input
            pInputText
            formControlName="totalTtc"
            class="w-full font-bold text-right"
            readonly
          />
        </div>
      </div>
  <!-- Boutons -->
    <div class="flex justify-end gap-3 mt-6">
      <button pButton label="Annuler" class="p-button-secondary" type="button" (click)="visibleAdd=false"></button>
      <button pButton label="Enregistrer" class="p-button-success" type="submit"></button>
    </div>

  </form>
</p-dialog>



<!-- Modal de modification-->
     <p-dialog
  header="Modification du Bon de Commande"
  [(visible)]="visible"
  (onShow)="calculateEditTotalTtc()"
  [modal]="true"
  [closable]="true"
  [style]="{ width: '900px' }"
>


  <form [formGroup]="editForm" (ngSubmit)="submitEdit()">

    <!-- Numéro + Fournisseur -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="font-semibold">Numéro Bon de Commande</label>
        <input
          pInputText
          [value]="selectedCommande?.numeroBonCommande"
          disabled
          class="w-full"
        />
      </div>

          <div>
      <label class="font-semibold">Fournisseur</label>
      <select 
        class="w-full p-2 border rounded"
        formControlName="fournisseurId"
      >
        <option *ngFor="let f of fournisseursOptions" [value]="f.id" [selected]="f.id === selectedCommande?.fournisseur?.id">
          {{ f.nomComplet }}
        </option>
      </select>
    </div>

    </div>

    <!-- Description -->
    <div class="mb-4">
      <label class="font-semibold">Description</label>
      <input pInputText formControlName="description" class="w-full" />
    </div>

    <!-- Statut -->
    <div class="mb-4">
      <label class="font-semibold">Statut</label>
      <select class="w-full p-2 border rounded" formControlName="statut">
        <option *ngFor="let s of statutOptions" [value]="s.value" [selected]="s.value === selectedCommande?.statut">
          {{ s.label }}
        </option>
      </select>
    </div>


    <!-- Dates -->
        <div class="grid grid-cols-3 gap-4 mb-6">

          <div>
            <label class="font-semibold">Date Bon de Commande</label>
             <input 
                type="text"
                class="w-full p-2 border rounded"
                [value]="formatDateToDDMMYYYY(editForm.get('dateCommande')?.value)" 
                disabled
              />
          </div>

          <div>
            <label class="font-semibold">Date d'expédition</label>
            <input 
              type="date" 
              class="w-full p-2 border rounded" 
              formControlName="dateExpedition"
              [min]="formatDateToInput(dateCommandeDisplay)"
            />
          </div>

          <div>
            <label class="font-semibold">Date de livraison</label>
            <input 
              type="date" 
              class="w-full p-2 border rounded" 
              formControlName="dateLivraison"
              [min]="dateCommandeDisplay ? formatDateToInput(dateCommandeDisplay) : null"
            />
          </div>

        </div>



   <!-- Bouton Ajouter au-dessus du tableau -->
<div class="flex justify-between items-center mb-2">
  <h3 class="text-lg font-semibold">Articles</h3>
  <button pButton type="button" label="Ajouter un article" icon="pi pi-plus"
          class="p-button-sm p-button-primary"
          (click)="addEmptyArticle()"></button>
</div>

<table class="p-datatable w-full border border-gray-300 rounded">
  <thead class="bg-gray-100">
    <tr>
      <th class="border border-gray-300 p-2">Code</th>
      <th class="border border-gray-300 p-2">Article</th>
      <th class="border border-gray-300 p-2">Quantité</th>
      <th class="border border-gray-300 p-2">Prix Achat</th>
      <th class="border border-gray-300 p-2">Actions</th>
    </tr>
  </thead>
  <tbody formArrayName="articles">
    <tr *ngFor="let item of articlesFormArray.controls; let i = index" [formGroupName]="i">

        <!-- Code -->
          <td class="border border-gray-300 p-2">
            <ng-container *ngIf="item.get('editing')?.value; else codeReadonly">
              <p-autoComplete
                  [suggestions]="filteredArticles[i]"
                  (completeMethod)="filterArticles($event, i)"
                  formControlName="articleObj"
                  [dropdown]="true"
                  (onSelect)="onArticleSelected($event, i)"
                  optionLabel="code"
                  dataKey="id"
                  placeholder="Code ou nom"
                  [forceSelection]="true">

                  <ng-template pTemplate="item" let-article>
                    {{ article.code }} - {{ article.nom }}
                  </ng-template>

                </p-autoComplete>

            </ng-container>

            <ng-template #codeReadonly>
              <!-- Affiche toujours le code réel si pas en édition -->
              <span>{{ item.get('code')?.value }}</span>
            </ng-template>
          </td>

          <!-- Nom -->
          <td class="border border-gray-300 p-2">
            <ng-container *ngIf="item.get('editing')?.value; else nomReadonly">
              <input pInputText type="text" formControlName="nom" placeholder="Nom de l'article" [readonly]="true" />
            </ng-container>

            <ng-template #nomReadonly>
              <span>{{ item.get('nom')?.value }}</span>
            </ng-template>
          </td>

          <!-- Quantité -->
          <td class="border border-gray-300 p-2">
            <input type="number"
                  pInputText
                  formControlName="quantite"
                  min="1"
                  class="w-24 p-inputtext-sm"
                  [readonly]="!item.get('editing')?.value" />
          </td>

          <!-- Prix Vente -->
          <td class="border border-gray-300 p-2">
            {{ item.get('prixAchat')?.value | number:'1.2-2' }} DT
          </td>

        <!-- Actions -->
        <td class="border border-gray-300 p-2 flex gap-2">
          <button pButton type="button" icon="pi pi-pencil" class="p-button-sm p-button-info"
                  *ngIf="!item.get('editing')?.value"
                  (click)="enableEdit(item)"></button>

          <button pButton type="button" icon="pi pi-check" class="p-button-sm p-button-success"
                  *ngIf="item.get('editing')?.value"
                  (click)="saveQuantity(item)"></button>

          <button pButton type="button" icon="pi pi-times" class="p-button-sm p-button-warning"
                  *ngIf="item.get('editing')?.value"
                  (click)="cancelEdit(item)"></button>

          <button pButton type="button" icon="pi pi-trash" class="p-button-sm p-button-danger"
                  (click)="removeArticle(i)"></button>
        </td>
    </tr>

  </tbody>
    </table>
      <div class="flex justify-end mt-4">
      <div class="w-64">
        <label class="font-semibold">Total TTC</label>
        <input
          pInputText
          formControlName="totalTtc"
          class="w-full font-bold text-right"
          readonly
        />
      </div>
    </div>

    <!-- Boutons -->
    <div class="flex justify-end gap-3 mt-6">
      <button
        pButton
        label="Annuler"
        class="p-button-secondary"
        type="button"
        (click)="closeModal()"
      ></button>

      <button
        pButton
        label="Enregistrer les modifications"
        class="p-button-success"
        type="submit"
      ></button>
    </div>

  </form>
</p-dialog>



<!-- Dialog de confirmation d'archivage -->
<p-dialog 
  header="Confirmation d'archivage" 
  [(visible)]="archiveDialogVisible" 
  [modal]="true" 
  [closable]="false" 
  [style]="{ width: '600px', minHeight: '300px' }"
>
  <!-- Contenu -->
  <div class="flex flex-col items-center text-center px-6 py-6 gap-4">

    <!-- Icône -->
    <i class="pi pi-exclamation-triangle text-red-800 text-7xl mb-2"></i>


    <!-- Texte principal -->
    <p class="text-lg font-medium text-gray-800">
      Êtes-vous sûr de vouloir archiver ce bon de commande ?
    </p>

    <!-- Numéro -->
    <p class="text-xl font-bold text-gray-900">
      N° {{ commandeToArchive?.numeroBonCommande }}
    </p>

  </div>

  <!-- Boutons -->
  <div class="flex justify-center gap-6 pb-6">
    <button
      pButton
      label="Archiver"
      icon="pi pi-trash"
      class="p-button-danger p-button-rounded"
      (click)="confirmArchive()">
    </button>

    <button
      pButton
      label="Annuler"
      icon="pi pi-times"
      class="p-button-secondary p-button-rounded"
      (click)="archiveDialogVisible=false">
    </button>
  </div>
</p-dialog>

<!--Telecharger PDF-->

  `,
  styles: [
    
    `
    .status-pill {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px; /* pill */
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
      display: inline-block;
      min-width: 80px;
      text-align: center;
    }


      .status-en-attente {
        background-color: #CE8F8A;
      }

      .status-en-cours {
        background-color: #B384A7;
      }

      .status-livre {
        background-color: #CA3C66;
      }

      .status-termine {
        background-color: #A1A27E;
      }

      .status-archive {
        background-color: #AD9C92;
      }

      .status-envoye {
        background-color: #CA3C66;
      }

      .p-button-rounded {
        transition: transform 0.2s ease, background-color 0.2s ease;
      }

      .p-button-rounded:hover {
        transform: translateY(-3px);
        background-color: rgba(0, 0, 0, 0.1);
      }

      .flex {
        display: flex;
        align-items: center;
      }

      .space-x-2 {
        margin-left: 0.5rem;
      }
      /* Bouton minimaliste */
        .edit-icon-btn.p-button {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0.5rem;
          color: #f59e0b; /* orange par défaut */
        }

        /* Hover actif */
        .edit-icon-btn.p-button:not(.p-disabled):hover {
          color: #d97706; /* orange plus foncé */
          background: transparent !important;
        }

        /* Désactivé : icône gris */
        .edit-icon-btn.p-button.p-disabled {
          color: #8d8f94 !important; /* gris moderne */
          cursor: not-allowed !important;
          opacity: 1 !important; /* pour garder icône bien visible */
        }
        .search-input {
          border: 1px solid #d1d5db; /* gris clair */
          border-radius: 0.5rem;      /* coins arrondis */
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s ease;
          background-color: #f9fafb;  /* fond légèrement gris */
        }

        .search-input:focus {
          border-color: #3b82f6;      /* bleu primaire au focus */
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); /* ombre bleue légère */
          background-color: #fff;      /* fond blanc au focus */
        }

        .pi-search {
          pointer-events: none; /* icône non cliquable */
        }
        .date-commande {
          color: #3498db; /* bleu pour Date Commande */
          font-weight: 600;
        }

        .date-livraison {
          color: #27ae60; /* vert pour Date Livraison */
          font-weight: 600;
        }

        .date-expedition {
          color: #d38507; /* orange pour Date Expédition */
          font-weight: 600;
        }


    `
  ],
  providers: [ConfirmationService, MessageService, ]
})
export class BonDeCommande implements OnInit {
  bonDeCommandes: any[] = [];  // Array to hold the fetched list of commandes
  searchQuery = '';    // Bind the search input
  fournisseursOptions: any[] = [];
    articlesOptions: any[] = [];
    selectedCommande: any;
    selectedArticlesIds: number[] = [];
    dateCommandeDisplay: Date | null = null;
    // Liste temporaire pour le modal
    modalArticles: any[] = [];
    filteredArticles: any[][] = [];
    archiveDialogVisible = false; // contrôle l'affichage du dialog
    commandeToArchive: any = null; // stocke la commande à archiver
    addForm!: FormGroup;
    visibleAdd = false;
    filteredArticlesAdd: any[][] = [];
    modalArticlesAdd: any[] = [];
    displayCommandeDetails: boolean = false;

   

    statutOptions = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'LIVRE', label: 'Livré' },
  { value: 'TERMINE', label: 'Terminé' },
  { value: 'ENVOYE', label: 'Envoyé' }
];



 visible = false; // contrôle du modal
  editForm!: FormGroup;
  @Input() bonCommande: any; // le bon de commande à modifier
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  @ViewChild('pdfContent') pdfContent!: ElementRef;

  constructor(private bonDeCommandeService: BonDeCommandeService,
    private fb: FormBuilder,
    private messageService: MessageService ,
     private confirmationService: ConfirmationService
    
  ) {}


 ngOnInit() {
  this.loadBonDeCommandes();  // Charger les commandes
  this.loadFournisseurs();    // Charger les fournisseurs
  this.loadArticles();        // <-- Charger la liste des articles
   this.initAddForm();
   this.updateStatutsAutomatiquement();
   this.bonDeCommandeService.getAllBonDeCommandes().subscribe(data => {
    this.bonDeCommandes = data;

    // 👉 APRES que les données arrivent
    this.bonDeCommandeService.getAllBonDeCommandes().subscribe(data => {
    this.bonDeCommandes = data;
    this.updateStatutsAutomatiquement(); // ✅ ici c'est correct
});
  });

  // Initialiser le formulaire
  this.editForm = this.fb.group({
    fournisseurId: [this.bonCommande?.fournisseur?.id || '', Validators.required],
    description: [this.bonCommande?.description || '', Validators.required],
    statut: [this.bonCommande?.statut || '', Validators.required],
    dateExpedition: [this.bonCommande?.dateExpedition || null, Validators.required],
    dateLivraison: [this.bonCommande?.dateLivraison || null, Validators.required],
    totalTtc: [0],
    articles: this.fb.array([])
  });

  // Initialiser filteredArticles pour chaque article du formulaire
  const articlesArray = this.editForm.get('articles') as FormArray;
  this.filteredArticles = articlesArray.controls.map(() => []);
}
getTotalBonCommande(commande: any): number {
  let total = 0;

  if (commande.articles && commande.articles.length > 0) {
    commande.articles.forEach((a: any) => {
      const quantite = a.quantite ?? 0;
      const prixAchat = a.article?.prixAchat ?? 0;
      total += prixAchat * quantite;
    });
  }

  return total;
}

updateStatutsAutomatiquement() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 🔥 ignore l'heure

  this.bonDeCommandes.forEach(commande => {
    const dateExp = new Date(commande.dateExpedition);
    dateExp.setHours(0, 0, 0, 0);

    const dateLiv = new Date(commande.dateLivraison);
    dateLiv.setHours(0, 0, 0, 0);

    let nouveauStatut: string | null = null;

    // Si dateLiv = aujourd'hui ou passée
    if (today.getTime() >= dateLiv.getTime()) {
      nouveauStatut = 'LIVRE';
    } else if (today.getTime() >= dateExp.getTime()) {
      nouveauStatut = 'ENVOYE';
    }

    if (nouveauStatut && nouveauStatut !== commande.statut) {
      const updateRequest = {
        description: commande.description || '',
        statut: nouveauStatut,
        fournisseurId: commande.fournisseur?.id || null,
        dateExpedition: commande.dateExpedition ? new Date(commande.dateExpedition).toISOString() : null,
        dateLivraison: commande.dateLivraison ? new Date(commande.dateLivraison).toISOString() : null,
        articles: commande.articles?.map((a: any) => ({
          articleId: a.article.id,
          quantite: a.quantite
        })) || []
      };

      this.bonDeCommandeService.modifierBonDeCommande(commande.id, updateRequest)
        .subscribe({
          next: (updated) => {
            console.log(`Commande ${commande.id} mise à jour au statut ${nouveauStatut}`);
            commande.statut = nouveauStatut; // 🔥 mettre à jour localement
          },
          error: (err) => console.error('Erreur mise à jour:', err)
        });
    }
  });
}
updateStatutAffichage(commande: any): string {
  const today = new Date();
  today.setHours(0,0,0,0);

  const dateLiv = new Date(commande.dateLivraison);
  dateLiv.setHours(0,0,0,0);

  const dateExp = new Date(commande.dateExpedition);
  dateExp.setHours(0,0,0,0);

  if (today.getTime() >= dateLiv.getTime()) return 'LIVRE';
  if (today.getTime() >= dateExp.getTime()) return 'ENVOYE';
  return commande.statut;
}


isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

  // Charger tous les fournisseurs depuis le backend
loadFournisseurs() {
  this.bonDeCommandeService.getAllFournisseurs().subscribe((data: any[]) => {
    this.fournisseursOptions = data.map(f => ({
      id: f.id,
      nomComplet: f.nom + ' ' + f.prenom  // Afficher nom + prénom
    }));
    console.log('Fournisseurs:', this.fournisseursOptions);
  });
}
onSearch(event: Event) {
  const input = event.target as HTMLInputElement | null;
  this.searchQuery = input?.value ?? '';
}
// Charger tous les articles depuis le backend
loadArticles() {
  this.bonDeCommandeService.getArticles().subscribe((data: any[]) => {
    // Remplir articlesOptions avec id, code, nom, prixAchat
    this.articlesOptions = data.map(a => ({
      id: a.id,
      code: a.code,
      nom: a.nom,
      prixAchat: a.prixAchat
    }));
    console.log('Liste des articles:', this.articlesOptions);
  });
}

initAddForm() {
  const todayStr = this.formatDateToInput(new Date());

  this.addForm = this.fb.group({
    numeroBonCommande: [{ value: this.generateBonCommandeNumber(), disabled: true }],
    fournisseurId: [null, Validators.required],
    description: ['', Validators.required],
    statut: ['EN_ATTENTE', Validators.required],
    dateCommande: [{ value: todayStr, disabled: true }],
    dateExpedition: [todayStr, Validators.required],
    dateLivraison: [todayStr, Validators.required],
    totalTtc: [{ value: 0, disabled: true }], // ✅ nouveau champ
    articles: this.fb.array([])
  });

  this.filteredArticlesAdd = [];
}

openAddCommandeDialog() {
  this.visibleAdd = true;
  this.addForm.get('totalTtc')?.setValue('0.00');


  // Réinitialiser le formulaire avec des dates par défaut
  const todayStr = this.formatDateToInput(new Date());

  this.addForm.reset({
    numeroBonCommande: this.generateBonCommandeNumber(),
    fournisseurId: null,
    description: '',
    statut: 'EN_ATTENTE',
    dateCommande: todayStr,
    dateExpedition: todayStr,
    dateLivraison: todayStr,
    articles: []
  });

  this.modalArticlesAdd = [];
  this.filteredArticlesAdd = [];
}

submitAdd() {
  if (!this.addForm.valid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez remplir tous les champs obligatoires.'
    });
    return;
  }

  const formValue = this.addForm.getRawValue(); // inclut champs disabled

  // Extraire les articles depuis le formArray
  const articlesForBackend = this.articlesFormArrayAdd.controls.map(ctrl => ({
    articleId: ctrl.get('articleId')?.value,
    quantite: ctrl.get('quantite')?.value,
    code: ctrl.get('code')?.value?.trim().toLowerCase() // si tu as le code dans le formArray
  }));

  // 🔴 Vérification doublons : articleId ou code
  const seenArticleIds = new Set<number>();
  const seenCodes = new Set<string>();
  let duplicateFound = false;

  for (const art of articlesForBackend) {
    if (seenArticleIds.has(art.articleId) || (art.code && seenCodes.has(art.code))) {
      duplicateFound = true;
      break;
    }
    seenArticleIds.add(art.articleId);
    if (art.code) seenCodes.add(art.code);
  }

  if (duplicateFound) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Deux articles avec le même code ou identifiant ont été ajoutés. Veuillez vérifier.'
    });
    return; // stop submit
  }

  const newBonCommande = {
    numeroBonCommande: formValue.numeroBonCommande,
    fournisseurId: Number(formValue.fournisseurId),
    description: formValue.description,
    statut: formValue.statut,
    dateCommande: new Date().toISOString(), // date actuelle pour la création
    dateExpedition: formValue.dateExpedition ? new Date(formValue.dateExpedition).toISOString() : null,
    dateLivraison: formValue.dateLivraison ? new Date(formValue.dateLivraison).toISOString() : null,
    totalTtc: Number(formValue.totalTtc),
    articles: articlesForBackend
  };

  console.log('newBonCommande:', newBonCommande);

  this.bonDeCommandeService.ajouterBonDeCommande(newBonCommande).subscribe({
    next: () => {
      this.loadBonDeCommandes();
      this.visibleAdd = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Le bon de commande a été ajouté avec succès.'
      });
    },
    error: (err) => {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible d’ajouter le bon de commande. Veuillez réessayer.'
      });
    }
  });
}

calculateTotalTtc() {
  let total = 0;

  this.articlesFormArrayAdd.controls.forEach(ctrl => {
    const prix = Number(ctrl.get('prixAchat')?.value) || 0;
    const quantite = Number(ctrl.get('quantite')?.value) || 0;
    total += prix * quantite;
  });

  this.addForm.get('totalTtc')?.setValue(total.toFixed(2), { emitEvent: false });
}
removeArticleAdd(index: number) {
  this.articlesFormArrayAdd.removeAt(index);
  this.filteredArticlesAdd.splice(index, 1);
  this.calculateTotalTtc(); // ✅ recalcul
}


// FormArray pour articles
get articlesFormArrayAdd() {
  return this.addForm.get('articles') as FormArray;
}
// Ajouter un article vide
addEmptyArticleAdd() {
  const group = this.fb.group({
    articleObj: [null, Validators.required],
    articleId: [null],
    code: [''],
    nom: [''],
    prixAchat: [0],
    quantite: [1, Validators.required]
  });

  // Recalcul automatique quand quantité change
  group.get('quantite')?.valueChanges.subscribe(() => {
    this.calculateTotalTtc();
  });

  // ✅ Insérer en PREMIÈRE position
  this.articlesFormArrayAdd.insert(0, group);

  // Important : garder filteredArticles synchronisé
  this.filteredArticlesAdd.splice(0, 0, []);
}


// Convertit une date (string ou Date) en format SQL complet
formatDateToSQL(date: string | Date | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = ('0' + (d.getMonth() + 1)).slice(-2);
  const dd = ('0' + d.getDate()).slice(-2);
  const hh = ('0' + d.getHours()).slice(-2);
  const min = ('0' + d.getMinutes()).slice(-2);
  const ss = ('0' + d.getSeconds()).slice(-2);

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}.000000`;
}


// Méthode pour filtrer les suggestions
filterArticles(event: any, index: number) {
  const query = event.query.toLowerCase();
  this.filteredArticles[index] = this.articlesOptions.filter(a =>
    a.nom.toLowerCase().includes(query) || a.code.toLowerCase().includes(query)
  );
}
// Quand on sélectionne un article depuis l'AutoComplete
onArticleSelected(event: any, index: number) {
  const article = event.value;
  if (!article) return;

  const formGroup = this.articlesFormArray.at(index) as FormGroup;

  formGroup.patchValue({
    articleObj: article,
    code: article.code,
    nom: article.nom,
    prixAchat: article.prixAchat,
    articleId: article.id,
    quantite: 1
  });

  // ✅ recalcul du total
  this.calculateEditTotalTtc();

  console.log('Article sélectionné (edit):', article);
  console.log('FormGroup après patch:', formGroup.value);
}


// Sélection article AutoComplete
onArticleSelectedAdd(event: any, index: number) {
  const article = event.value;
  const formGroup = this.articlesFormArrayAdd.at(index) as FormGroup;

  formGroup.patchValue({
    articleObj: article,
    code: article.code,
    nom: article.nom,
    prixAchat: article.prixAchat,
    articleId: article.id,
    quantite: 1
  });

  this.calculateTotalTtc(); // ✅ recalcul automatique
}

 
filterArticlesAdd(event: any, index: number) {
  const query = event.query.toLowerCase();
  this.filteredArticlesAdd[index] = this.articlesOptions.filter(a =>
    a.nom.toLowerCase().includes(query) || a.code.toLowerCase().includes(query)
  );
}

// Génération du numéro de BC
generateBonCommandeNumber(): string {
  const now = new Date();
  const yyyy = now.getFullYear().toString().slice(-2);
  const mm = ('0' + (now.getMonth() + 1)).slice(-2);
  const dd = ('0' + now.getDate()).slice(-2);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BC-${yyyy}${mm}${dd}-${random}`;
}

  loadBonDeCommandes() {
  this.bonDeCommandeService.getAllBonDeCommandes().subscribe(
    (data) => {
      // Convertir les dates en objets Date
      this.bonDeCommandes = data.map((commande: any) => ({
        ...commande,
        dateCommande: commande.dateCommande ? new Date(commande.dateCommande) : null,
        dateExpedition: commande.dateExpedition ? new Date(commande.dateExpedition) : null,
        dateLivraison: commande.dateLivraison ? new Date(commande.dateLivraison) : null,
      }));
      console.log('Liste des commandes:', this.bonDeCommandes);
    },
    (error) => {
      console.error('Erreur lors de la récupération des commandes:', error);
    }
  );
}


  filteredBonDeCommandes() {
  return this.bonDeCommandes
    .filter(cmd => cmd.statut !== 'ARCHIVE')  // <-- exclut les commandes archivées
    .filter(cmd => {
      // Si vous avez déjà un champ de recherche
      return this.searchQuery
        ? cmd.numeroBonCommande.toLowerCase().includes(this.searchQuery.toLowerCase())
        : true;
    });
}


  mapStatut(statut: string): string {
    const statutMap: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'LIVRE': 'Livré',
      'TERMINE': 'Terminé',
      'ARCHIVE': 'Archivé',
      'ENVOYE': 'Envoyé'
    };
    return statutMap[statut] || statut;
  }

  getStatusProgress(statut: string): number {
    switch (statut) {
      case 'EN_ATTENTE':
        return 20; // Example: 20% for EN_ATTENTE
      case 'EN_COURS':
        return 50; // Example: 50% for EN_COURS
      case 'LIVRE':
        return 100; // Example: 100% for LIVRE
      case 'TERMINE':
        return 90; // Example: 90% for TERMINE
      case 'ARCHIVE':
        return 0; // Example: 0% for ARCHIVE
      case 'ENVOYE':
        return 75; // Example: 75% for ENVOYE
      default:
        return 0;
    }
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'status-en-attente';
      case 'EN_COURS':
        return 'status-en-cours';
      case 'LIVRE':
        return 'status-livre';
      case 'TERMINE':
        return 'status-termine';
      case 'ARCHIVE':
        return 'status-archive';
      case 'ENVOYE':
        return 'status-envoye';
      default:
        return '';
    }
  }

  deleteCommande(commande: any) {
    console.log('Delete commande:', commande);
  }

// Fonction utilitaire pour convertir Date -> yyyy-MM-dd
formatDateToInput(date: Date | string | null): string {
  if (!date) {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // yyyy-MM-dd
}

get articlesFormArray() {
  return this.editForm.get('articles') as FormArray;
}

  // Ouvre le modal pour éditer
openEditModal(commande: any) {

  this.selectedCommande = commande;

  const today = new Date();
  this.dateCommandeDisplay = today;

  this.editForm = this.fb.group({
    fournisseurId: [commande.fournisseur?.id || null, Validators.required],
    description: [commande.description, Validators.required],
    statut: [commande.statut, Validators.required],
    dateCommande: [this.formatDateToInput(today), Validators.required],
    dateExpedition: [
      commande.dateExpedition ? this.formatDateToInput(commande.dateExpedition) : null,
      Validators.required
    ],
    dateLivraison: [
      commande.dateLivraison ? this.formatDateToInput(commande.dateLivraison) : null,
      Validators.required
    ],

    totalTtc: [0],   // AJOUT IMPORTANT

    articles: this.fb.array([])
  });

  const articlesFormArray = this.editForm.get('articles') as FormArray;

  commande.articles.forEach((a: any) => {
    const group = this.fb.group({
      articleObj: [a.article || null, Validators.required],
      code: [a.article.code || ''],
      nom: [a.article.nom || ''],
      prixAchat: [a.article.prixAchat || 0],
      quantite: [a.quantite || 1, [Validators.required, Validators.min(1)]],
      oldQuantite: [a.quantite || 1],
      editing: [false],
      articleId: [a.article.id || null]
    });

    group.get('quantite')?.valueChanges.subscribe(() => {
      this.calculateEditTotalTtc();
    });

    articlesFormArray.push(group);
  });

  // 🔥 calcul initial
  this.calculateEditTotalTtc();

  this.visible = true;
}

  // Soumission du formulaire
submitEdit() {
  const articlesArray = this.editForm.get('articles') as FormArray;

  // Validation quantité
  const invalidArticle = articlesArray.controls.find(
    a => a.get('quantite')?.value <= 0 || a.get('quantite')?.value === null
  );

  if (invalidArticle) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez entrer une quantité valide (minimum 1) pour tous les articles.'
    });
    return;
  }

  // Vérification des doublons de codes d'articles
  const articleCodes = articlesArray.controls.map(ctrl => ctrl.get('articleId')?.value);
  const duplicateCodes = articleCodes.filter((value, index, self) => self.indexOf(value) !== index);

  if (duplicateCodes.length > 0) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Certains articles ont des codes dupliqués. Veuillez vérifier les articles.'
    });
    return;
  }

  if (!this.editForm.valid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez remplir tous les champs obligatoires.'
    });
    return;
  }

  // 🔥 Transformer les articles pour backend
  const articlesForBackend = articlesArray.controls.map(ctrl => ({
    articleId: ctrl.get('articleId')?.value,
    quantite: ctrl.get('quantite')?.value
  }));

  const payload = {
    fournisseurId: this.editForm.get('fournisseurId')?.value,
    description: this.editForm.get('description')?.value,
    statut: this.editForm.get('statut')?.value,
    dateExpedition: this.editForm.get('dateExpedition')?.value,
    dateLivraison: this.editForm.get('dateLivraison')?.value,
    //totalTtc: this.editForm.getRawValue().totalTtc,
    totalTtc: Number(this.editForm.get('totalTtc')?.value),
    articles: articlesForBackend
  };

  console.log("Payload envoyé :", payload);

  this.bonDeCommandeService
    .modifierBonDeCommande(this.selectedCommande.id, payload)
    .subscribe({
      next: (res: any) => {
        this.loadBonDeCommandes();
        this.closeModal();
        this.messageService.add({
          severity: 'success',
          summary: 'Modification réussie',
          detail: `Le bon de commande "${res.numeroBonCommande}" a été modifié avec succès !`
        });
      },
      error: (err) => {
        console.error("Erreur backend:", err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de modifier le bon de commande.'
        });
      }
    
    });
}

calculateEditTotalTtc() {
  let total = 0;

  const articlesArray = this.editForm.get('articles') as FormArray;

  articlesArray.controls.forEach(ctrl => {
    const prix = Number(ctrl.get('prixAchat')?.value) || 0;
    const quantite = Number(ctrl.get('quantite')?.value) || 0;
    total += prix * quantite;
  });

  this.editForm.get('totalTtc')?.setValue(total.toFixed(2));
}

  // Gestion des checkboxes articles
  onArticleChange(event: any) {
    const id = +event.target.value;
    if (event.target.checked) {
      if (!this.selectedArticlesIds.includes(id)) this.selectedArticlesIds.push(id);
    } else {
      this.selectedArticlesIds = this.selectedArticlesIds.filter(aid => aid !== id);
    }
    this.editForm.controls['articles'].setValue(this.selectedArticlesIds);
  }

  isArticleSelected(id: number): boolean {
    return this.selectedArticlesIds.includes(id);
  }

removeArticle(index: number) {
  const articlesFormArray = this.editForm.get('articles') as FormArray;
  if (index > -1 && index < articlesFormArray.length) {
    articlesFormArray.removeAt(index);
    this.modalArticles.splice(index, 1);
    this.calculateEditTotalTtc(); // 🔥 recalcul immédiat
  }
}
enableEdit(item: AbstractControl) {
  // sauvegarder la quantité AVANT modification
  item.get('oldQuantite')?.setValue(item.get('quantite')?.value);

  // passer en mode édition
  item.get('editing')?.setValue(true);
}

saveQuantity(item: AbstractControl) {
  // confirmer la nouvelle quantité
  item.get('editing')?.setValue(false);

  // mettre à jour l’ancienne valeur
  item.get('oldQuantite')?.setValue(item.get('quantite')?.value);
}

cancelEdit(item: AbstractControl) {
  const oldQty = item.get('oldQuantite')?.value;

  // restaurer l’ancienne quantité
  item.get('quantite')?.setValue(oldQty);

  // sortir du mode édition
  item.get('editing')?.setValue(false);
}
closeModal() {
  this.visible = false;

  if (this.selectedCommande) {
    // Re-créer le FormArray à partir des articles originaux
    const articlesFormArray = this.editForm.get('articles') as FormArray;
    articlesFormArray.clear();

    this.modalArticles = [...this.selectedCommande.articles]; // Recharger les articles initiaux

    this.modalArticles.forEach(a => {
      articlesFormArray.push(
      this.fb.group({
        articleObj: [a.article || null, Validators.required], // <-- stocke l'objet entier
        code: [a.article?.code || ''],
        nom: [a.article?.nom || ''],
        prixAchat: [a.article?.prixAchat || 0],
        quantite: [a.quantite || 0, [Validators.required, Validators.min(1)]],
        oldQuantite: [a.quantite || 0],
        editing: [false],
        articleId: [a.article?.id || null]
      })
    );

    });
  }
}

getTodayAsInputDate(): string {
  const today = new Date();
  const month = ('0' + (today.getMonth() + 1)).slice(-2);
  const day = ('0' + today.getDate()).slice(-2);
  return `${today.getFullYear()}-${month}-${day}`;
}

formatDateToDDMMYYYY(date: Date | string | null): string {
  if (!date) return '';
  const d = new Date(date);
  const day = ('0' + d.getDate()).slice(-2);
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
addEmptyArticle() {
  const articlesFormArray = this.editForm.get('articles') as FormArray;
  const group = this.fb.group({
    articleObj: [null, Validators.required],
    code: [''],
    nom: [''],
    prixAchat: [0],
    quantite: [1, [Validators.required, Validators.min(1)]],
    oldQuantite: [1],
    editing: [true],
    articleId: [null]
  });

  group.get('quantite')?.valueChanges.subscribe(() => {
    this.calculateEditTotalTtc();
  });

  articlesFormArray.push(group);
  this.calculateEditTotalTtc(); // 🔥 recalcul après ajout
}


// Appelé à chaque modification du champ code/nom
onArticleSelect(event: any, index: number) {
  const selectedValue = event.target.value;
  const articlesFormArray = this.editForm.get('articles') as FormArray;
  const formGroup = articlesFormArray.at(index);

  // Chercher l'article correspondant
  const found = this.articlesOptions.find(a =>
    a.code === selectedValue || a.nom.toLowerCase() === selectedValue.toLowerCase()
  );

  if (found) {
    formGroup.patchValue({
      code: found.code,
      nom: found.nom,
      prixAchat: found.prixAchat,
      articleId: found.id
    });

    // Mettre à jour modalArticles pour correspondre
    this.modalArticles[index] = {
      article: { ...found },
      quantite: null
    };
  }
}

archiveCommande(commande: any) {
  this.commandeToArchive = commande;  // stocker la commande sélectionnée
  this.archiveDialogVisible = true;   // ouvrir le modal
}
confirmArchive() {
  if (!this.commandeToArchive) return;

  // Bloquer si statut LIVRE ou ENVOYE
  if (this.commandeToArchive.statut === 'LIVRE' || this.commandeToArchive.statut === 'ENVOYE') {
    this.messageService.add({
      severity: 'warn',
      summary: 'Action impossible',
      detail: 'Cette commande ne peut pas être archivée car elle est livrée ou envoyée.'
    });
    return;
  }

  this.bonDeCommandeService.archiverBonDeCommande(this.commandeToArchive.id).subscribe(
    (updatedCommande) => {
      this.bonDeCommandes = this.bonDeCommandes.filter(c => c.id !== this.commandeToArchive.id);

      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: `Le bon de commande "${updatedCommande.numeroBonCommande}" a été archivé avec succès !`
      });

      this.archiveDialogVisible = false;
      this.commandeToArchive = null;
    },
    (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible d’archiver la commande. Veuillez réessayer.'
      });
      console.error('Erreur lors de l’archivage', error);
    }
  );
}

async convertImageToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // éviter les problèmes CORS
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg'); // ou 'image/png'
      resolve(dataURL);
    };
    img.onerror = (err) => reject(err);
  });
}
async downloadCommande(commande: any) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ---------------- LOGO ----------------
  let logoBase64 = '';
  try {
    logoBase64 = await this.convertImageToBase64('assets/logo-hah.jpg');
  } catch (err) {
    console.error('Erreur logo', err);
  }
  if (logoBase64) {
    doc.addImage(logoBase64, 'JPEG', pageWidth - 54, 10, 40, 30);
  }

  // ---------------- INFOS SOCIÉTÉ ----------------
  let startY = 20;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Société Hosni Ayed Holding", 14, startY);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Avenue Hbib Bourguiba Kisbet el Madiouni", 14, startY + 6);
  doc.text("Email: contact@hosniayed.com", 14, startY + 12);
  doc.text("Tél: +216 71 000 000", 14, startY + 18);
  doc.text("Code TVA: 1810075L/A/M/000", 14, startY + 24);

  // ---------------- TITRE ----------------
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("BON DE COMMANDE", pageWidth / 2, startY + 40, { align: 'center' });

  // ---------------- INFOS COMMANDE ----------------
  startY += 50;
  const rectX = 12;
  const rectY = startY;
  const rectWidth = pageWidth - 24;
  const rectHeight = 36;

  doc.rect(rectX, rectY, rectWidth, rectHeight);
  doc.setFontSize(10);

  doc.text(`N°: ${commande.numeroBonCommande || 'N/A'}`, rectX + 4, rectY + 6);

  const rightX = rectX + rectWidth - 4;
  doc.text(
    `Date : ${commande.dateCommande ? new Date(commande.dateCommande).toLocaleDateString() : 'N/A'}`,
    rightX,
    rectY + 6,
    { align: 'right' }
  );
  doc.text(
    `Date de livraison : ${commande.dateLivraison ? new Date(commande.dateLivraison).toLocaleDateString() : 'N/A'}`,
    rightX,
    rectY + 12,
    { align: 'right' }
  );

  const fournisseur = commande.fournisseur || {};
  doc.text(`Fournisseur: ${fournisseur.nom || 'N/A'} ${fournisseur.prenom || ''}`, rectX + 4, rectY + 14);
  doc.text(`Adresse: ${fournisseur.adresse || 'N/A'}`, rectX + 4, rectY + 20);
  doc.text(`Email: ${fournisseur.email || 'N/A'}`, rectX + 4, rectY + 26);
  doc.text(`Tél: ${fournisseur.tel || 'N/A'}`, rectX + 4, rectY + 32);

  // Ligne séparation
  startY += 36;
  doc.line(14, startY, pageWidth - 14, startY);

  // ---------------- TABLEAU ----------------
  const tableColumn = ["#", "Code", "Article", "Quantité", "Prix Unitaire"];
  const tableRows: any[] = [];
  let total = 0;

  if (commande.articles && commande.articles.length > 0) {
    commande.articles.forEach((a: any, index: number) => {
      const quantite = a.quantite ?? 0;
      const prixAchat = a.article?.prixAchat ?? 0;
      total += prixAchat * quantite;
      tableRows.push([
        index + 1,
        a.article?.code || 'N/A',
        a.article?.nom || 'N/A',
        quantite,
        prixAchat.toFixed(2) + ' DT'
      ]);
    });
  }

  const MAX_ROWS_PER_PAGE = 20;
  const pages = [];

  // Découper les lignes en pages
  for (let i = 0; i < tableRows.length; i += MAX_ROWS_PER_PAGE) {
    pages.push(tableRows.slice(i, i + MAX_ROWS_PER_PAGE));
  }

  let currentY = startY + 10;
  const bottomReservedSpace = 35;
  const tableWidth = pageWidth - 28; // réduire largeur table

  pages.forEach((pageRows, pageIndex) => {
    autoTable(doc, {
        startY: currentY,
        head: [tableColumn],
        body: pageRows,
        theme: 'grid',
        margin: { left: 14, right: 14, bottom: bottomReservedSpace },
        styles: { 
          fontSize: 9, 
          cellPadding: 0.9, // réduit l'espace vertical et horizontal dans la cellule
          valign: 'middle' 
        },
        headStyles: { fillColor: [220, 53, 69], textColor: 255, fontStyle: 'bold' },
        pageBreak: 'auto'
      });


    if (pageIndex < pages.length - 1) {
      doc.addPage();
      currentY = 20;
    }
  });

  // ---------------- TOTAL + SIGNATURE ----------------
const totalY = pageHeight - 60; // position du total depuis le bas
doc.setFont("helvetica", "bold");
doc.text(`TOTAL TTC: ${total.toFixed(2)} DT`, pageWidth - 20, totalY, { align: 'right' });

const signatureY = totalY + 6; // 6 mm sous le total
doc.setFont("helvetica", "normal");
doc.text("Signature", pageWidth - 20, signatureY, { align: 'right' });


  // ---------------- NUMERO PAGE ----------------
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(`Page ${i} / ${pageCount}`, pageWidth - 25, pageHeight - 30);
  }

  // ---------------- SAVE ----------------
  doc.save(`BonCommande_${commande.numeroBonCommande || 'N-A'}.pdf`);
}
checkDatesAndSendEmail(bonCommande: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Ignore l'heure pour comparer seulement la date

  const dateExpedition = new Date(bonCommande.dateExpedition);
  dateExpedition.setHours(0, 0, 0, 0);

  const dateLivraison = new Date(bonCommande.dateLivraison);
  dateLivraison.setHours(0, 0, 0, 0);

  if (today.getTime() === dateExpedition.getTime() || today.getTime() === dateLivraison.getTime()) {
    this.bonDeCommandeService.sendEmail(bonCommande.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Email envoyé',
          detail: `Un email a été envoyé pour le bon de commande "${bonCommande.numeroBonCommande}".`
        });
      },
      error: (err) => {
        console.error('Erreur envoi email:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible d\'envoyer l\'email.'
        });
      }
    });
  }
}

}