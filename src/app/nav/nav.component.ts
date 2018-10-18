import { Component, OnInit, HostBinding, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnChanges {
  @HostBinding('class.content-container') contentContainer = true;
  @Input() link;

  collapsed = false;
  menuItems;

  constructor(private _router: Router) {
  }

  ngOnInit() {

  }

  ngOnChanges() {

    this.menuItems = [
      {
        caption: 'Activity summary',
        link: './clearance_dashboard/summary/' + this.link
      },
      {
        caption: 'Live status',
        link: './clearance_dashboard/live/' + this.link
      },
      {
        caption: 'Historical data',
        link: './clearance_dashboard/history/' + this.link
      }
    ];
    // if (this.link === 'Prerate') {
    //   this.menuItems.splice(1, 0, {
    //     caption: 'Today\'s data',
    //     link: './table/' + this.link
    //   });
    // }
    this._router.navigate(['clearance_dashboard/summary', this.link]);
  }
}
