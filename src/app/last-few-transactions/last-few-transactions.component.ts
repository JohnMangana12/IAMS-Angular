import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-last-few-transactions',
    templateUrl: './last-few-transactions.component.html',
    styleUrls: ['./last-few-transactions.component.scss'],
    standalone: false
})
export class LastFewTransactionsComponent implements OnInit {

  transactions = [
    {
      id: 1,
      title: "PSS-121",
      price: "Dell PowerEdge T640",
      shop: "CC5314",
      location: "Team Diwata",
      status: "Checkout",
      imgSrc: 'assets/server.jpg'
    },
    {
      id: 2,
      title: "TE-1109L",
      price: "Dell Latitude 5440",
      shop: "CC5336",
      location: "Team Infra",
      status: "Asset Update",
      imgSrc: 'assets/laptop.jpg'
    },
    {
      id: 3,
      title: "TE-MTR-014",
      price: "Dell LCD Monitor",
      shop: "CC5318",
      location: "Team Luna",
      status: "Change Status",
      imgSrc: 'assets/monitor.jpg'
    }
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
