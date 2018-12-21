import { Component, HostBinding, OnInit, ElementRef } from '@angular/core';
import * as _ from 'lodash';
import { DatasourceService } from './datasource.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @HostBinding('class.main-container') mainContainer = true;
  _ = _;
  logo = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAAARCAYAAAAyqiXFAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkJCNkY4RjE0NEI3QTExRTdCNzVGRjY2QkI4MTBDRDg1IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkJCNkY4RjE1NEI3QTExRTdCNzVGRjY2QkI4MTBDRDg1Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QkI2RjhGMTI0QjdBMTFFN0I3NUZGNjZCQjgxMENEODUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QkI2RjhGMTM0QjdBMTFFN0I3NUZGNjZCQjgxMENEODUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6/sUa0AAADmElEQVR42uxaX4iMURS/882MGWtn7Fps2MXuCrWoLYk3KQ8UCuXB31KKZyRb4sHDllq8epEQRSsPeOFJ8iBFifUilqxda5oxY5kxO87xnS93J2buvee2833ZU7/mzp9zf9+999xzzz1nQqVSSYCsABwFLAPMAxQBv7/QlAjgA2Al4GeF350D7KHfbAA8EWayFXABEAacAvQq6JwB7CfuTYDHhtzdgMM0VziWOwo6dwGrAHlDzhCN9RPgFaAPcEVR9wZgHeAHk/sj4DXx9uGCtwCe0pc2ZCaRVZL5gAZq1zG4sI8Z1J6tqNMicU9jcM+V+kkq6iyWnpc7x52AbTTXlxV0FgEaLXEvJ+7NEdpJtoxH0O6o5r3SUrvA4PoutXOKOhmpnWdwf5Xaqrt6BNBO84PtMQZ/E63bWcC1Kh4f5YvU/myJuzdCx40nGwH9jI7DtChFMSmVBDdNF2BIwVuXS4l0XgA6yKMlACkN/dWAAQNuTx+PzzbArEjZLsZYZHhyfSdEhpgesMjwosNMbs975Z0y19dcg4lMMXQzATYgbtjgLWLMIAywxZ2M+GAiF1BkrzsoNPw5ATYgvDyMMvTr6bUHkNXUjTOfPUGvJ/xgQLfIGBwDFx4LqPFEKVwoGIzbu6A0UkrimMF1/BGTO0lpkx4/GFBc/H+Ci7iQ2QcGskcMdW1wn8SGHwxolDyQyW0kGmADzAqzZK0nS4SbHNxumGopGM45hhpLARcB+/xgQFuEmw3WdacYyO0QbiY6iIJX6XcMfbzGYzIPk4i7NHXXCjebbGJAGHthtWEvIO0HA3ovxifldHdSUGWAMW4UL3m5E3BQs6+UME8kZqQUwCGnbOenajCRDRZuAzoijzfNPHr/1qeqTLEQR3nPoesIwpa4RyJifC2qlSwsxOh8zOBaOZFSL7WxnvXG0JXLhh+rgQE5Erfu80eZN0iPL44G9FL8KWfcF/wyBOZ0OkX12kyt5DnFTig3GeOVjeaZgf5DOoZMSxmt9P6bwVH4gI4h0yDaKx5n0YBOA3bTB3UWFiih8GDTLe2Gqf/wLJUEi48HhJvAtDHeqxTQqkiT1G6ztCG6hVomWv4XQLsl7uNoQFg8XS/c/7Z00EKUDK+YDnmgarpvKQDG4y7HGABWmAfJYAcVdXDHrhFuEq6LjDmkMV6HFgzrSfdoAVWln4yWUwl3aAwYhN8GnFfUw1tXM4M7RMjRxec64NIvAQYAt1XDBt5LOdsAAAAASUVORK5CYII=`;
  links = ['Wholesale property', 'Retail commercial'];
  user = '';
  currentLink;

  close:boolean = true;

  constructor(private _datasourceService: DatasourceService,
              private el:ElementRef) { }

  ngOnInit() {
    this.currentLink = this.links[0];
    this._datasourceService.getLoggedinUser().subscribe((response) => {
      this.user = response.email;
    });

    let refreshClearInterval;
    // this.el.nativeElement.addEventListener("click", function() { 
    //   clearInterval(refreshClearInterval);
    //   // refresh();
    // });

    function refresh(){
      refreshClearInterval = setInterval(()=>{
        window.location.reload();
      },840000);
    }
    // refresh();
  }
}
