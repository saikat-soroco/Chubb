import { Component, OnInit, Input } from '@angular/core';
import { ClrDatagridStringFilterInterface } from '@clr/angular';
import { DatasourceService } from '../datasource.service';

class GenericStringFilter implements ClrDatagridStringFilterInterface<any> {
  colName: string;

  constructor(colName) {
    this.colName = colName;
  }
  accepts(record: any, search: string): boolean {
    if (!record[this.colName]) {
      return;
    }
    return '' + record[this.colName] === search
      || record[this.colName].toString().toLowerCase().indexOf(search) >= 0;
  }
}

@Component({
  selector: 'app-nested-table',
  templateUrl: './nested-table.component.html',
  styleUrls: ['./nested-table.component.css']
})
export class NestedTableComponent implements OnInit {

  @Input() id;


  keyCols = [];

  displayRecordData = [{ 'master_id': 1, 'policy_number': 52412691, 'policy_type': '', 'transaction_effective_date': '2018, 7, 1', 'status': '', 'started_at': '' },
  { 'master_id': 2, 'policy_number': 52412691, 'policy_type': '', 'transaction_effective_date': '2018, 7, 1', 'status': '', 'started_at': '' },
  { 'master_id': 3, 'policy_number': 52412691, 'policy_type': '', 'transaction_effective_date': '2018, 7, 1', 'status': '', 'started_at': '' }];

  keyColNames = [];
  showAllCols;
  columnFilters: object = {};

  constructor(private _datasourceService: DatasourceService) {

  }

  ngOnInit() {
    setTimeout(() => {
      document.querySelector('.datagrid-host')['style'] = '';
    }, 100);

    this.initialize();
  }

  initialize() {
    
  }

}
