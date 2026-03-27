import { Component, signal, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { RippleModule } from 'primeng/ripple';
import { BonDeCommandeService } from '@/service/bonDeCommande.service';

interface Product {
  name: string;
  image: string;
  price: number;
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    ButtonModule,
    MenuModule,
    TableModule,
    ChartModule,
    RippleModule
  ],
  template: `
  <div class="dashboard-container">

    <div class="grid grid-cols-12 gap-8">

      <!-- Conteneur pour les 3 stats alignées sur la même ligne -->
      <div class="col-span-12 flex gap-4 justify-between" style="width: 100%;">
        <div *ngFor="let stat of stats" class="flex-1 min-w-0">
          <div class="card p-4 rounded shadow">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block font-bold text-lg mb-2">
                  "{{ stat.value }}" {{ stat.title }}
                </span>
                <div [ngClass]="stat.percentColor" class="mt-1">
                  {{ stat.percent }}
                </div>
              </div>
              <div class="flex items-center justify-center rounded-border"
                   [ngClass]="stat.bg"
                   style="width:2.5rem; height:2.5rem">
                <i [class]="stat.icon"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= LEFT COLUMN ================= -->
      <div class="col-span-12 xl:col-span-6">
        <div class="card mb-8">
          <div class="font-semibold text-xl mb-4">Recent Sales</div>

          <p-table [value]="products()" [paginator]="true" [rows]="5" responsiveLayout="scroll">
            <ng-template pTemplate="header">
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>View</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-product>
              <tr>
                <td style="width:15%">
                  <img [src]="'https://primefaces.org/cdn/primevue/images/product/' + product.image"
                       width="50" />
                </td>
                <td>{{ product.name }}</td>
                <td>{{ product.price | currency:'USD' }}</td>
                <td>
                  <button pButton pRipple icon="pi pi-search"
                          class="p-button-text p-button-icon-only">
                  </button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- ================= RIGHT COLUMN ================= -->
      <div class="col-span-12 xl:col-span-6">
        <div class="card mb-8">
          <div class="font-semibold text-xl mb-4">Revenue Stream</div>
          <p-chart type="bar"
                   [data]="chartData()"
                   [options]="chartOptions()"
                   style="height:400px">
          </p-chart>
        </div>
      </div>

    </div>

  </div>
`
})
export class Dashboard {

  products = signal<Product[]>([]);
  chartData = signal<any>(null);
  chartOptions = signal<any>(null);

  bonDeCommandes = signal<any[]>([]);

  get stats() {
  const commandes = this.bonDeCommandes();
  const total = commandes.length || 1; // éviter division par zéro

  const enCoursCount = commandes.filter(c => c.statut === 'EN_COURS').length;
  const livreCount = commandes.filter(c => c.statut === 'LIVRE').length;
  const envoyeCount = commandes.filter(c => c.statut === 'ENVOYE').length;

  const percent = (count: number) => ((count / total) * 100).toFixed(1) + '%';

  return [
    {
      title: 'Bon de commande en cours',
      value: enCoursCount,
      percent: percent(enCoursCount),
      percentColor: 'text-purple-500 font-bold',
      icon: 'pi pi-shopping-cart text-purple-500 text-xl',
      bg: 'bg-purple-100 dark:bg-purple-400/10'
    },
    {
      title: 'Bon de commande Livré',
      value: livreCount,
      percent: percent(livreCount),
      percentColor: 'text-pink-500 font-bold',
      icon: 'pi pi-check text-pink-500 text-xl',
      bg: 'bg-pink-100 dark:bg-pink-400/10'
    },
    {
      title: 'Bon de commande envoyé',
      value: envoyeCount,
      percent: percent(envoyeCount),
      percentColor: 'text-teal-500 font-bold',
      icon: 'pi pi-send text-teal-500 text-xl',
      bg: 'bg-teal-100 dark:bg-teal-400/10'
    }
  ];
}

  constructor(private bonDeCommandeService: BonDeCommandeService) {
    this.loadProducts();
    afterNextRender(() => {
      setTimeout(() => this.initChart(), 100);
    });
  }

  ngOnInit() {
    this.loadBonDeCommandes();
  }

  loadBonDeCommandes() {
    this.bonDeCommandeService.getAllBonDeCommandes().subscribe(
      (data) => {
        this.bonDeCommandes.set(
          data.map((commande: any) => ({
            ...commande,
            dateCommande: commande.date_commande ? new Date(commande.date_commande) : null,
            dateExpedition: commande.date_expedition ? new Date(commande.date_expedition) : null,
            dateLivraison: commande.date_livraison ? new Date(commande.date_livraison) : null,
          }))
        );
      },
      (error) => {
        console.error('Erreur lors de la récupération des commandes:', error);
      }
    );
  }

  loadProducts() {
    this.products.set([
      { name: 'Space T-Shirt', image: 'bamboo-watch.jpg', price: 65 },
      { name: 'Black Watch', image: 'black-watch.jpg', price: 72 },
      { name: 'Blue Band', image: 'blue-band.jpg', price: 79 },
      { name: 'Game Controller', image: 'game-controller.jpg', price: 99 },
      { name: 'Galaxy Earrings', image: 'galaxy-earrings.jpg', price: 34 }
    ]);
  }

  initChart() {
    this.chartData.set({
      labels: ['Q1','Q2','Q3','Q4'],
      datasets: [
        { label: 'Subscriptions', backgroundColor: '#6366F1', data: [4000,10000,15000,4000] },
        { label: 'Advertising', backgroundColor: '#A5B4FC', data: [2100,8400,2400,7500] },
        { label: 'Affiliate', backgroundColor: '#C7D2FE', data: [4100,5200,3400,7400] }
      ]
    });

    this.chartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked:true },
        y: { stacked:true }
      }
    });
  }
}