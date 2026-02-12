import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
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
;
import {ObjectUtils} from "primeng/utils";
import { ArticleService } from '@/service/articles.service';
import { Article } from '@/models/Article';
import { Fournisseurs } from './fournisseurs';
import { FournisseurService } from '@/service/fournisseurs.service';
import { Fournisseur } from '@/models/Fournisseurs';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
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
        FloatLabelModule

    ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    template: ` 
    <!-- Toast pour notifications -->
    <p-toast position="bottom-center"></p-toast>

      <div class="card" style="width: 100%; height: 100vh; overflow: auto;">
     
     <h1 class="text-3xl font-semibold text-gray-800">Articles</h1>
    <div class="flex items-center justify-between mb-5 w-full">
                
                <div class="flex items-center justify-center gap-3 flex-1 ml-40">
                    <label class="font-medium text-gray-700 whitespace-nowrap">
                        Recherche article :
                    </label>

                    <p-iconfield iconPosition="left">
                        <p-inputicon styleClass="pi pi-search"></p-inputicon>

                        <input
                            pInputText
                            type="text"
                            class="w-110"
                            [(ngModel)]="searchValue"
                             placeholder="Rechercher par nom, code, famille ou fournisseur"
                            (input)="applyGlobalFilter($event)"
                        />
                    </p-iconfield>
                </div>


                <!-- Boutons Ajouter et Export Excel -->
                <div class="flex items-center gap-2">
                <button
                    pButton
                    label="Ajouter"
                    icon="pi pi-plus"
                    class="p-button-danger"
                    (click)="openAddArticleDialog()">
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
    <p-table [value]="filteredArticles" rowGroupMode="subheader" [tableStyle]="{ 'width': '100%' }">
        <ng-template #header>
            <tr>
                <th>Nom</th>
                <th>Code</th>
                <th>Prix Achat</th>
                <th>Famille</th>
                <th>Prix Vente</th>
                <th>Image</th>
                <th>Fournisseur</th>
                <th>Actions</th> <!-- Colonne d'actions -->
            </tr>
        </ng-template>
        <ng-template #body let-article>
           <tr>
                <td>{{ article.nom }}</td>
                <td>{{ article.code }}</td>
                <td>{{ article.prixAchat }}</td>
              <td>
                   <p-tag
                        [value]="article.famille"
                        [style]="{
                            'background-color': getFamilleColor(article.famille),
                            'color': '#374151',
                            'font-weight': '600',
                            'border-radius': '6px',
                            'padding': '0.25rem 0.6rem'
                        }">
                    </p-tag>
                </td>


                <td>{{ article.prixVente }}</td>
                <td>
                    <img *ngIf="article.image" [src]="getImageUrl(article.image)" alt="Image de {{ article.nom }}" style="width: 60px; height: 60px; object-fit: contain;" />
                </td>
                <td>{{ article.fournisseur ? (article.fournisseur.nom + ' ' + article.fournisseur.prenom) : '' }}</td>

                <td>
                    <button
                        pButton
                        icon="pi pi-pencil"
                        class="p-button-rounded p-button-text p-button-warning"
                        pTooltip="Modifier article"
                        tooltipPosition="top"
                        (click)="openEditArticleDialog(article)">
                    </button>

                    <button
                        pButton
                        icon="pi pi-trash"
                        class="p-button-rounded p-button-text p-button-danger"
                        pTooltip="Supprimer article"
                        tooltipPosition="top"
                        (click)="openDeleteArticleDialog(article)">
                    </button>
                </td>
            </tr>

        </ng-template>
    </p-table>


<!-- Modal pour ajouter un article -->
<p-dialog [(visible)]="displayAddArticleDialog" [modal]="true" [closable]="false" header="Ajouter un Article"
    styleClass="custom-modal" [style]="{'width': '60%', 'max-width': '800px', 'height': 'auto'}">
   
    <form [formGroup]="articleForm" (ngSubmit)="onSubmitAdd()" class="p-fluid">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4"> <!-- Réduit le gap ici -->

            <!-- Nom Field -->
            <div class="flex flex-col gap-4">
                <p-floatlabel class="mt-2 mb-4"> <!-- Réduit l'espace ici -->
                    <input pInputText id="nom" formControlName="nom" [class.p-invalid]="articleForm.get('nom')?.invalid && articleForm.get('nom')?.touched" class="w-full"/>
                    <label for="nom">Nom</label>
                </p-floatlabel>

                <!-- Code Field -->
                <p-floatlabel class="mt-2 mb-4">
                    <input pInputText id="code" formControlName="code" [class.p-invalid]="articleForm.get('code')?.invalid && articleForm.get('code')?.touched" class="w-full" />
                    <label for="code">Code</label>
                </p-floatlabel>

                <!-- Prix Achat Field -->
                <p-floatlabel class="mt-2 mb-4">
                    <input pInputText id="prixAchat" formControlName="prixAchat" type="number" [class.p-invalid]="articleForm.get('prixAchat')?.invalid && articleForm.get('prixAchat')?.touched" class="w-full"/>
                    <label for="prixAchat">Prix Achat</label>
                </p-floatlabel>

                <!-- Prix Vente Field -->
                <p-floatlabel class="mt-2 mb-4">
                    <input pInputText id="prixVente" formControlName="prixVente" type="number" [class.p-invalid]="articleForm.get('prixVente')?.invalid && articleForm.get('prixVente')?.touched" class="w-full"/>
                    <label for="prixVente">Prix Vente</label>
                </p-floatlabel>

                <!-- famille-->
               <p-floatlabel class="mt-2 mb-4 relative">
                    <div class="flex items-center">
                        <input
                        pInputText
                        id="famille"
                        [value]="selectedFamille"
                        placeholder="Sélectionner une famille"
                        readonly
                        (click)="toggleFamilleDropdown()"
                        class="w-full"
                        />
                        <button type="button"
                                class="p-button p-button-icon p-button-rounded p-button-outlined p-button-secondary ml-2"
                                (click)="toggleFamilleDropdown()">
                        <i class="pi pi-chevron-down"></i>
                        </button>
                    </div>

                    <!-- Dropdown familles -->
                    <div *ngIf="showFamilleDropdown" class="absolute z-10 bg-white border border-gray-300 shadow-lg w-full mt-1 max-h-60 overflow-auto">
                        <ul>
                         <li *ngFor="let f of famillesNettoyage"
                            (click)="onFamilleSelect(f.value)"
                             class="cursor-pointer p-2 hover:bg-gray-200">
                            {{ f.label }}
                        </li>
                        </ul>
                    </div>
                    </p-floatlabel>


                <!-- Fournisseur Field (Input avec flèche) -->
                    <p-floatlabel class="mt-2 mb-4 relative">
                        <div class="flex items-center">
                            <input
                            pInputText
                            [value]="selectedFournisseur ? selectedFournisseur.nom + ' ' + selectedFournisseur.prenom : ''"
                            formControlName="fournisseurId"
                            [placeholder]="'Sélectionner un fournisseur'"
                            readonly
                            (click)="toggleFournisseurDropdown()"
                            class="w-full"
                            />
                            <button type="button" class="p-button p-button-icon p-button-rounded p-button-outlined p-button-secondary ml-2" (click)="toggleFournisseurDropdown()">
                                <i class="pi pi-chevron-down"></i>
                            </button>
                        </div>

                        <!-- Affichage de la liste des fournisseurs -->
                        <div *ngIf="showFournisseurDropdown" class="absolute z-10 bg-white border border-gray-300 shadow-lg w-full mt-1">
                            <ul>
                                <li *ngFor="let fournisseur of fournisseurs" (click)="onFournisseurSelect(fournisseur)" class="cursor-pointer p-2 hover:bg-gray-200">
                                    {{ fournisseur.nom }} {{ fournisseur.prenom }}
                                </li>
                            </ul>
                        </div>
                    </p-floatlabel>
                    

            </div>

            <!-- Image & Buttons -->
                <div class="flex flex-col gap-4 justify-center items-center">
                    <div class="flex flex-col gap-2">
                        <label class="font-medium">Image</label>

                        <!-- Si une image est sélectionnée, affichez l'aperçu et les boutons -->
                        <div *ngIf="imagePreview" class="flex flex-col items-center gap-3">

                            <!-- ✅ IMAGE AU-DESSUS -->
                            <img
                                [src]="imagePreview"
                                alt="Image de l'article"
                                style="
                                    width: 100%;
                                    height: 100%;
                                    max-width: 320px;
                                    max-height: 320px;
                                    object-fit: contain;
                                    display: block;
                                "
                                />


                            <!-- ✅ BOUTON EN DESSOUS -->
                            <button
                                pButton
                                type="button"
                                label="Modifier l'image"
                                icon="pi pi-pencil"
                                class="p-button-warning"
                                (click)="triggerFileInput()">
                            </button>

                        </div>

                        <div *ngIf="!imagePreview" class="flex justify-center mt-4">
                            <button
                                pButton
                                type="button"
                                label="Ajouter Image"
                                icon="pi pi-plus"
                                class="p-button-danger"
                                (click)="triggerFileInput()">
                            </button>
                        </div>


                       

                        <!-- Affichage du nom de l'image sous forme de texte (facultatif) -->
                        <small *ngIf="selectedImage && typeof selectedImage !== 'string'" class="p-text-sm">
                            Image sélectionnée : {{ selectedImage?.name }}
                        </small>
                    </div>   
                </div>





            <!-- Center Buttons -->
            <div class="flex justify-center gap-6 mt-6"> <!-- Augmenté mt-4 à mt-6 -->
              
               <button
                    pButton
                    type="submit"
                    label="Enregistrer"
                    icon="pi pi-check"
                    class="p-button-danger"
                    [disabled]="articleForm.invalid">
                </button>

                <button pButton type="button" label="Annuler" icon="pi pi-times" class="p-button-secondary" (click)="closeAddArticleDialog()"></button>
            </div>
        </div>
    </form>
</p-dialog>


<!-- Modal pour modifier un article -->
<p-dialog [(visible)]="displayEditArticleDialog" [modal]="true" [closable]="false" header="Modifier l'Article"
    styleClass="custom-modal" [style]="{'width': '60%', 'max-width': '800px', 'height': 'auto'}">
    <form [formGroup]="articleForm" (ngSubmit)="onSubmitEdit()">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <!-- Nom Field -->
            <div class="flex flex-col gap-4">
                <p-floatlabel class="mt-2 mb-4">
                    <input pInputText id="nom" formControlName="nom" [class.p-invalid]="articleForm.get('nom')?.invalid && articleForm.get('nom')?.touched" class="w-full"/>
                    <label for="nom">Nom</label>
                </p-floatlabel>

                <!-- Code Field -->
                <p-floatlabel class="mt-2 mb-4">
                    <input pInputText id="code" formControlName="code" [class.p-invalid]="articleForm.get('code')?.invalid && articleForm.get('code')?.touched" class="w-full"/>
                    <label for="code">Code</label>
                </p-floatlabel>

                <!-- Prix Achat Field -->
                <p-floatlabel class="mt-2 mb-4">
                    <input pInputText id="prixAchat" formControlName="prixAchat" type="number" [class.p-invalid]="articleForm.get('prixAchat')?.invalid && articleForm.get('prixAchat')?.touched" class="w-full"/>
                    <label for="prixAchat">Prix Achat</label>
                </p-floatlabel>

                <!-- Prix Vente Field -->
                <p-floatlabel class="mt-2 mb-4">
                    <input pInputText id="prixVente" formControlName="prixVente" type="number" [class.p-invalid]="articleForm.get('prixVente')?.invalid && articleForm.get('prixVente')?.touched" class="w-full"/>
                    <label for="prixVente">Prix Vente</label>
                </p-floatlabel>


                <!-- Famille Field -->
                <p-floatlabel class="mt-2 mb-4 relative">
                <div class="relative mt-2 mb-4 w-full">
                    <p-floatlabel class="w-full">
                        <div class="flex items-center">
                        <input
                            pInputText
                            id="famille"
                            [value]="selectedFamille"
                            placeholder="Sélectionner une famille"
                            readonly
                            (click)="toggleFamilleDropdown()"
                            class="w-full"
                        />
                        <button type="button"
                                class="p-button p-button-icon p-button-rounded p-button-outlined p-button-secondary ml-2"
                                (click)="toggleFamilleDropdown()">
                            <i class="pi pi-chevron-down"></i>
                        </button>
                        </div>
                    </p-floatlabel>

                    <!-- Dropdown familles -->
                    <div *ngIf="showFamilleDropdown"
                        class="absolute z-10 bg-white border border-gray-300 shadow-lg w-full mt-1 max-h-60 overflow-auto">
                        <ul>
                        <li *ngFor="let f of famillesNettoyage"
                            (click)="onFamilleSelect(f.value)"
                            class="cursor-pointer p-2 hover:bg-gray-200">
                            {{ f.label }}
                        </li>
                        </ul>
                    </div>
                    </div>
                </p-floatlabel>

                <!-- Fournisseur Field -->

                <p-floatlabel class="mt-2 mb-4 relative">
                    <div class="flex items-center">
                      <input
                            pInputText
                            id="fournisseur"
                            formControlName="fournisseurNom" 
                            placeholder="Sélectionner un fournisseur"
                            readonly
                            (click)="toggleFournisseurDropdown()"
                            class="w-full"
                            [value]="selectedFournisseur ? (selectedFournisseur.nom + ' ' + selectedFournisseur.prenom) : ''"/>
                       


                       
                        <button type="button" 
                                class="p-button p-button-icon p-button-rounded p-button-outlined p-button-secondary ml-2" 
                                (click)="toggleFournisseurDropdown()">
                            <i class="pi pi-chevron-down"></i>
                        </button>
                    </div>

                    <!-- Dropdown des fournisseurs -->
                    <div *ngIf="showFournisseurDropdown" class="absolute z-10 bg-white border border-gray-300 shadow-lg w-full mt-1 max-h-60 overflow-auto">
                        <ul>
                            <li *ngFor="let fournisseur of fournisseurs" 
                                (click)="onFournisseurSelect(fournisseur)" 
                                class="cursor-pointer p-2 hover:bg-gray-200">
                                {{ fournisseur.nom }} {{ fournisseur.prenom }}
                            </li>
                        </ul>
                    </div>
                </p-floatlabel>





           

            </div>

            <!-- Image & Buttons -->
            <div class="flex flex-col gap-4 justify-center items-center">
                <div class="flex flex-col gap-2">
                    <label class="font-medium">Image</label>
                    <div *ngIf="selectedImage">
                        <p *ngIf="selectedImage"> <!-- Si c'est une URL -->
                            <img [src]="imagePreview" alt="Image de l'article" style="width: 200px; height: 200px; object-fit: contain;" />
                        </p>
                        <div *ngIf="selectedImage && typeof selectedImage !== 'string'">
                            <!-- Si c'est un fichier sélectionné -->
                            <p>{{ selectedImage?.name }}</p>
                        </div>
                        <button pButton type="button" label="Modifier l'image" icon="pi pi-pencil" class="p-button-warning mt-2" (click)="triggerFileInput()"></button>
                        </div>
                        <div *ngIf="!selectedImage" class="flex justify-center mt-4">
                        <button pButton type="button" label="Ajouter Image" icon="pi pi-plus" class="p-button-danger" (click)="triggerFileInput()"></button>
                        </div>


                    <small *ngIf="selectedImage && typeof selectedImage !== 'string'" class="p-text-sm">
                        Image sélectionnée : {{ selectedImage?.name }}
                    </small>
                </div>
            </div>
            <!-- Center Buttons -->
            <div class="flex justify-center gap-6 mt-6">
                <button pButton type="submit" label="Enregistrer" icon="pi pi-check" class="p-button-danger"  [disabled]="articleForm.invalid"></button>
                <button pButton type="button" label="Annuler" icon="pi pi-times" class="p-button-secondary" (click)="closeEditArticleDialog()"></button>
            </div>
        </div>
    </form>
</p-dialog>

<!-- Modal pour supprimer un article -->
<p-dialog [(visible)]="displayDeleteArticleDialog" [modal]="true" [closable]="false" header="Confirmer la Suppression"
    styleClass="custom-modal" [style]="{'width': '60%', 'max-width': '800px', 'height': 'auto'}">
    <div class="flex flex-col gap-4">
        <!-- Affichage du nom et de l'image de l'article -->
        <div class="flex justify-center items-center flex-col">
            <p class="font-medium">Êtes-vous sûr de vouloir supprimer cet article ?</p>
            <p class="font-semibold">{{ selectedArticleForDeletion?.nom }}</p>
            <div *ngIf="selectedArticleForDeletion?.image">
               

                    <img
                        [src]="getImageUrl(selectedArticleForDeletion?.image)"
                        alt="Image de {{ selectedArticleForDeletion?.nom }}"
                        style="
                            width: 100%;
                            height: 100%;
                            max-width: 320px;
                            max-height: 320px;
                            object-fit: contain;
                            display: block;
                            margin-top: 10px;
                        "
                        />

            </div>
        </div>

        <div class="flex justify-center gap-6 mt-6">
            <button pButton type="button" label="Supprimer" icon="pi pi-check" class="p-button-danger" 
                (click)="deleteArticleConfirmed()" [disabled]="!selectedArticleForDeletion"></button>
            <button pButton type="button" label="Annuler" icon="pi pi-times" class="p-button-secondary" 
                (click)="closeDeleteArticleDialog()"></button>
        </div>
    </div>
</p-dialog>





`,
    styles: `
        .p-datatable-frozen-tbody {
            font-weight: bold;
        }

        .p-datatable-scrollable .p-frozen-column {
            font-weight: bold;
        }
    `,
    providers: [ConfirmationService, MessageService, CustomerService, ProductService]
})

export class Articles implements OnInit {

    // Déclarer articleForm comme une instance de FormGroup
  articleForm: FormGroup;
  displayEditArticleDialog: boolean = false;
  selectedArticle: Article | null = null;  // Variable pour stocker l'article sélectionné pour la modification
  showFournisseurDropdown: boolean = false;  // Variable pour afficher/masquer le dropdown
  selectedFournisseur: Fournisseur | null = null;  // Fournisseur sélectionné dans le dropdown
 // Variables pour le modal de suppression
    displayDeleteArticleDialog: boolean = false;
    selectedArticleForDeletion: Article | null = null; // L'article sélectionné pour la suppression
    filteredArticles: Article[] = [];
    searchQuery: string = '';
    nomRecherche: string = '';
    codeRecherche: string = '';
    familleRecherche: string = '';
    searchValue: string = '';
    imagePreview: string | null = null;
    selectedFamille: string | null = null;
    showFamilleDropdown: boolean = false;
    famillesNettoyage = [
    { label: 'Produits ménagers', value: 'Produits ménagers' },
    { label: 'Désinfectants', value: 'Désinfectants' },
    { label: 'Liquides vaisselle', value: 'Liquides vaisselle' },
    { label: 'Éponges', value: 'Éponges' },
    { label: 'Balais', value: 'Balais' },
    { label: 'Produits alimentaires', value: 'Produits alimentaires' },
    { label: 'Boissons', value: 'Boissons' },
    { label: 'Hygiène bébé', value: 'Hygiène bébé' },
    { label: 'Alimentation bébé', value: 'Alimentation bébé' },
    { label: 'Autres', value: 'Autres' }
];




    @ViewChild('filter') filter!: ElementRef;
    @ViewChild('dt') dt!: Table;

  constructor(private fb: FormBuilder, private articleService: ArticleService,
     private messageService: MessageService ,
    private fournisseurService: FournisseurService) {
    // Initialiser articleForm avec un formulaire réactif
       this.articleForm = this.fb.group({
        nom: ['', Validators.required],
        code: ['', Validators.required],
        prixAchat: [0, [Validators.required, Validators.min(1)]],
        prixVente: [0, [Validators.required, Validators.min(1)]],
        famille: ['', Validators.required],
        fournisseurId: [null, Validators.required],
         fournisseurNom: [''], // juste pour affichage
        image: [null]
        });
        ;}

  articles: Article[] = [];
  fournisseurs: Fournisseur[] = [];
  newArticle: Article = {
    id: 0,
    nom: "",
    code: "",
    prixAchat: 0,
    famille: "",
    prixVente: 0,
    image: "",
    fournisseurId:0,
  };
  displayAddArticleDialog: boolean = false;
  selectedImage: File | string | null = null;


  ngOnInit(): void {
    console.log('ngOnInit Articles');
    this.loadArticles();
    this.loadFournisseurs();
    this.articleForm.statusChanges.subscribe(status => {
    console.log('🧩 STATUS FORM:', status);
    console.log('❌ Champs invalides:',
        Object.keys(this.articleForm.controls)
            .filter(key => this.articleForm.get(key)?.invalid)
    );
});


    this.articleForm.valueChanges.subscribe(val => {
        console.log('--- Formulaire changé ---');
        console.log('Nom:', val.nom);
        console.log('Code:', val.code);
        console.log('Prix Achat:', val.prixAchat);
        console.log('Prix Vente:', val.prixVente);
        console.log('Famille:', val.famille);
        console.log('FournisseurId:', val.fournisseurId);
        console.log('Image:', val.image);
        console.log('Formulaire valide ?', this.articleForm.valid);
    });
}


  loadArticles() {
    this.articleService.getArticles().subscribe((data) => {
      this.articles = data;
      console.log("liste des articels", data )
       this.filteredArticles = [...data]; // copie
    });
  }
  applyGlobalFilter(event: Event) {
  const value = (event.target as HTMLInputElement).value
    .toLowerCase()
    .trim();

  if (!value) {
    this.filteredArticles = [...this.articles];
    return;
  }

  this.filteredArticles = this.articles.filter(article =>
    article.nom?.toLowerCase().includes(value) ||
    article.code?.toLowerCase().includes(value) ||
    article.famille?.toLowerCase().includes(value) ||
    article.fournisseur?.nom?.toLowerCase().includes(value)
  );
}


  loadFournisseurs() {
    this.fournisseurService.getFournisseurs().subscribe((data) => {
      this.fournisseurs = data;
      console.log("liste des fournisseurs", data )
    });
  }


  openAddArticleDialog() {
    // Reset formulaire et variables
    this.articleForm.reset({
        nom: '',
        code: '',
        prixAchat: 0,
        prixVente: 0,
        famille: '',
        fournisseurId: null,
        image: null
    });
    this.selectedFournisseur = null;
    this.selectedImage = null;
    this.selectedFamille = null;
    this.displayAddArticleDialog = true;
    this.imagePreview = null;
   
}

  closeAddArticleDialog() {
    this.displayAddArticleDialog = false;
  }


onSubmitAdd() {
    console.log('🚀 onSubmitAdd déclenché');

    console.log('📋 Form value:', this.articleForm.value);
    console.log('📋 Form valid ?', this.articleForm.valid);

    console.log('🏷 Fournisseur sélectionné:', this.selectedFournisseur);
    console.log('🖼 Image sélectionnée:', this.selectedImage);
    console.log('🖼 instanceof File ?', this.selectedImage instanceof File);
     // 🔴 Vérification : code article déjà existant
    const codeSaisi = this.articleForm.value.code?.trim().toLowerCase();

    const codeExiste = this.articles.some(
        a => a.code?.toLowerCase() === codeSaisi
    );

    if (codeExiste) {
        this.messageService.add({
            severity: 'error',
            summary: 'Code déjà utilisé',
            detail: 'Un article avec ce code existe déjà. Veuillez utiliser un autre code.'
        });

        // ❌ NE PAS fermer le modal
        return;
    }

    if (this.articleForm.invalid) {
        console.error('❌ Formulaire invalide');
        return;
    }

    if (!this.selectedFournisseur) {
        console.error('❌ Fournisseur non sélectionné');
        return;
    }

    if (!(this.selectedImage instanceof File)) {
        console.error('❌ Image NON valide (pas un File)');
        return;
    }

    const formData = new FormData();

    formData.append('nom', this.articleForm.value.nom);
    formData.append('code', this.articleForm.value.code);
    formData.append('prixAchat', this.articleForm.value.prixAchat.toString());
    formData.append('prixVente', this.articleForm.value.prixVente.toString());
    formData.append('famille', this.articleForm.value.famille);
    formData.append('fournisseurId', this.selectedFournisseur.id.toString());
    formData.append('image', this.selectedImage);

    console.log('📦 FormData final :');
    formData.forEach((v, k) => console.log(`➡ ${k}:`, v));

    this.articleService.addArticle(formData).subscribe({
        next: (res) => {
            console.log('✅ Article ajouté:', res);
            this.articles.push(res);
            this.filteredArticles = [...this.articles];
            this.closeAddArticleDialog();
             // Afficher un toast success
            this.messageService.add({
                severity: 'success',
                summary: 'Ajout réussi',
                detail: `L'article "${res.nom}" a été ajouté.`
        });
        },
        error: (err) => {
            console.error('🔥 ERREUR BACKEND:', err);
             this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible d’ajouter l’article.'
        });
        }
    });
}

isCodeDuplicate(): boolean {
    const code = this.articleForm.get('code')?.value?.toLowerCase();
    return this.articles.some(a => a.code?.toLowerCase() === code);
}


onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        this.selectedImage = file;
        this.articleForm.patchValue({ image: file }); // <-- important !
    } else {
        this.selectedImage = null;
        this.articleForm.patchValue({ image: null }); // <-- sinon le formulaire reste invalide
    }
}
// Fonction pour supprimer l'image
    removeImage() {
        this.selectedImage = null;
        console.log('Image supprimée');
    }

    // Fonction pour déclencher le champ de sélection de fichier
   triggerFileInput() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = (event: any) => {
        const file: File = event.target.files[0];

        console.log('📂 File sélectionné:', file);
        console.log('📂 Type:', file?.type);
        console.log('📂 instanceof File ?', file instanceof File);

        if (file) {
            this.selectedImage = file; // ✅ GARDER LE FILE
             this.imagePreview = URL.createObjectURL(file);
            this.articleForm.patchValue({ image: file });
            this.articleForm.get('image')?.updateValueAndValidity();
        }
    };

    fileInput.click();
}



  deleteArticle(id: number) {
    this.articleService.deleteArticle(id).subscribe(
      () => {
        this.articles = this.articles.filter((article) => article.id !== id); // Supprimer l'article de la liste
        this.messageService.add({
            severity: 'success',
            summary: 'Suppression réussie',
            detail: `L'article "${this.selectedArticleForDeletion?.nom}" a été supprimé.`
        });
      },
      (error) => {
        this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de supprimer l’article.'
        });
        console.error("Erreur lors de la suppression de l'article", error);
      }
    );
  }

 /* getImageUrl(imagePath: string): string {
    return `http://localhost:8080/articles/images/${imagePath}`;
  }*/

  getImageUrl(imagePath: string | undefined): string {
  return imagePath ? `http://localhost:8080/articles/images/${imagePath}` : 'path/to/default-image.jpg';
}


// Ouvrir modal modification
openEditArticleDialog(article: Article) {
  this.selectedArticle = article;

  // Trouver fournisseur
  const fournisseurMatch = this.fournisseurs.find(f => f.id === article.fournisseur?.id) || null;
  this.selectedFournisseur = fournisseurMatch;
  this.selectedFamille = article.famille || null;

  this.articleForm.patchValue({
    nom: article.nom,
    code: article.code,
    prixAchat: article.prixAchat,
    prixVente: article.prixVente,
    famille: article.famille || null,
    fournisseurId: fournisseurMatch?.id,
    fournisseurNom: fournisseurMatch ? fournisseurMatch.nom + ' ' + fournisseurMatch.prenom : '',
    image: null // mettre null pour ne pas casser la validation
  });

  // Image preview : utiliser getImageUrl pour le nom de fichier renvoyé
  if (article.image) {
    this.imagePreview = this.getImageUrl(article.image);
    this.selectedImage = article.image; // conserver string existante
} else {
    this.imagePreview = null;
    this.selectedImage = null;
}
  this.displayEditArticleDialog = true;
}

// Soumettre modification
onSubmitEdit() {
  if (!this.selectedArticle || this.articleForm.invalid) return;
  
const codeSaisi = this.articleForm.value.code?.trim().toLowerCase();

    // 🔴 Vérification : code déjà utilisé par un AUTRE article
    const codeExiste = this.articles.some(a =>
        a.code?.toLowerCase() === codeSaisi &&
        a.id !== this.selectedArticle!.id   // ⭐ clé ici
    );

    if (codeExiste) {
        this.messageService.add({
            severity: 'error',
            summary: 'Code déjà utilisé',
            detail: 'Ce code est déjà utilisé par un autre article. Veuillez en choisir un autre.'
        });

        // ❌ NE PAS fermer le modal
        return;
    }
  const formData = new FormData();
  formData.append('nom', this.articleForm.value.nom);
  formData.append('code', this.articleForm.value.code);
  formData.append('prixAchat', this.articleForm.value.prixAchat.toString());
  formData.append('prixVente', this.articleForm.value.prixVente.toString());
  formData.append('famille', this.articleForm.value.famille);
  formData.append('fournisseurId', this.selectedFournisseur!.id.toString());

  if (this.selectedImage instanceof File) {
      // Nouvelle image
      formData.append('image', this.selectedImage);
  } else if (typeof this.selectedImage === 'string') {
      // Ancienne image conservée
      formData.append('imageName', this.selectedImage); // <-- côté backend doit gérer imageName
  }

  this.articleService.updateArticle(this.selectedArticle.id, formData).subscribe({
      next: (updated) => {
          this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Article modifié avec succès'
          });

          const index = this.articles.findIndex(a => a.id === this.selectedArticle!.id);
          if (index !== -1) {
              this.articles[index] = updated;
          }

          this.filteredArticles = [...this.articles];
          this.closeEditArticleDialog();
      },
      error: (err) => console.error('Erreur backend:', err)
  });
}

isCodeDuplicateOnEdit(): boolean {
    const code = this.articleForm.get('code')?.value?.toLowerCase();
    if (!code || !this.selectedArticle) return false;

    return this.articles.some(a =>
        a.code?.toLowerCase() === code &&
        a.id !== this.selectedArticle!.id
    );
}



    closeEditArticleDialog() {
        this.displayEditArticleDialog = false;
    }

   


getFournisseurNom(): string {
    console.log("nom de fournisseur", this.selectedFournisseur?.nom);
    // Ensure you're returning an empty string if no supplier is selected
    return this.selectedFournisseur ? this.selectedFournisseur.nom : '';
}

toggleFournisseurDropdown() {
    // Inverser la visibilité du dropdown à chaque clic
    this.showFournisseurDropdown = !this.showFournisseurDropdown;
}
/*FournisseurSelect(fournisseur: Fournisseur) {
    console.log('Fournisseur sélectionné:', fournisseur);
    this.selectedFournisseur = fournisseur;

    // Patcher l'ID pour le backend
    this.articleForm.patchValue({
        fournisseurId: fournisseur.id,
        fournisseurNom: fournisseur.nom // pour affichage
    });

    this.articleForm.get('fournisseurId')?.updateValueAndValidity();
    this.articleForm.get('fournisseurNom')?.updateValueAndValidity();

    console.log('Après patch fournisseurId:', this.articleForm.value);
    console.log('Formulaire valide ?', this.articleForm.valid);

    this.showFournisseurDropdown = false;
}
*/
onFournisseurSelect(fournisseur: Fournisseur) {
    this.selectedFournisseur = fournisseur;

    this.articleForm.patchValue({
        fournisseurId: fournisseur.id,   // <-- assure que c'est un nombre valide
        fournisseurNom: fournisseur.nom + ' ' + fournisseur.prenom // <-- nom + prénom
    });

    // forcer la validation
    this.articleForm.get('fournisseurId')?.updateValueAndValidity();

    this.showFournisseurDropdown = false;

    console.log('Form après patch fournisseurId:', this.articleForm.value);
}




openDeleteArticleDialog(article: Article) {
    this.selectedArticleForDeletion = article; // Assigner l'article à supprimer
    this.displayDeleteArticleDialog = true; // Afficher le modal de suppression
}

closeDeleteArticleDialog() {
    this.displayDeleteArticleDialog = false; // Fermer le modal
}
deleteArticleConfirmed() {
    if (this.selectedArticleForDeletion) {
        this.articleService.deleteArticle(this.selectedArticleForDeletion.id).subscribe(
            () => {
                // Mettre à jour la liste des articles
                this.articles = this.articles.filter(
                    article => article.id !== this.selectedArticleForDeletion?.id
                );

                // Afficher le toast
                this.messageService.add({
                    severity: 'success',
                    summary: 'Suppression réussie',
                    detail: `L'article "${this.selectedArticleForDeletion?.nom}" a été supprimé.`
                });
                this.filteredArticles = [...this.articles];
                this.closeDeleteArticleDialog(); // Fermer le modal
            },
            (error) => {
                console.error('Erreur lors de la suppression de l\'article:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de supprimer l’article.'
                });
            }
        );
    }
}

// Méthode de filtrage des articles
  onSearch() {
  this.articleService.searchArticles(
    this.searchValue, // nom
    this.searchValue, // code
    this.searchValue  // famille
  ).subscribe(res => {
    this.articles = res;
  });
}
exportToExcel() {
    if (!this.articles || this.articles.length === 0) {
        this.messageService.add({ severity: 'warn', summary: 'Aucune donnée', detail: 'Il n\'y a aucun article à exporter.' });
        return;
    }

    // Préparer les données à exporter
    const exportData = this.articles.map(article => ({
        Nom: article.nom,
        Code: article.code,
        PrixAchat: article.prixAchat,
        PrixVente: article.prixVente,
        Famille: article.famille,
        Fournisseur: article.fournisseur?.nom || '',
    }));

    // Créer le workbook
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Articles': worksheet }, SheetNames: ['Articles'] };

    // Convertir en buffer
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Sauvegarder le fichier
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'Articles.xlsx');
}
toggleFamilleDropdown() {
  this.showFamilleDropdown = !this.showFamilleDropdown;
}

// Quand l'utilisateur sélectionne une famille
onFamilleSelect(famille: string) {
  this.selectedFamille = famille;

  // Patch le formControl pour que Angular reactive form le reconnaisse
  this.articleForm.patchValue({ famille: famille });
  this.articleForm.get('famille')?.updateValueAndValidity();

  this.showFamilleDropdown = false;

  console.log('Famille sélectionnée:', famille);
}

getFamilleColor(famille: string | null): string {
    if (!famille) return '#64748b';

    const index = this.famillesNettoyage.findIndex(f => f.value === famille);
    if (index === -1) return '#64748b';

    return this.familleColors[index % this.familleColors.length];
}
familleColors: string[] = [
    '#FECACA', // rouge clair (unqualified)
    '#FED7AA', // orange clair (negotiation)
    '#BBF7D0', // vert clair (qualified)
    '#BFDBFE', // bleu clair (new)
    '#DDD6FE', // violet clair (renewal)
    '#C7D2FE', // indigo clair
    '#A7F3D0', // teal clair
    '#E5E7EB', // gris clair
    '#FEF3C7', // jaune clair
    '#E0F2FE', // sky clair
];





}