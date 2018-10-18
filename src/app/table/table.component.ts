import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ClrDatagridStringFilterInterface } from '@clr/angular';
import { DatasourceService } from '../datasource.service';
import { CommonService } from '../common.service';
import { findLast } from '@angular/compiler/src/directive_resolver';

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
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})

export class TableComponent implements OnInit, OnDestroy {
  @Input()
  datePicker: boolean;
  @Input()
  tableTitlePrefix: string = 'Current day - Submission Status for ';
  @Input()
  duration;

  dateFrom: string;
  dateTo: string;
  selectedDateFrom: string;
  selectedDateTo: string;


  @Output()
  selectedProcessEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(private _activatedRoute: ActivatedRoute, private _datasource: DatasourceService, public _commonService: CommonService) {
    this._activatedRoute.params.subscribe((params) => {
      this._commonService.setContext(params['context']);
    });
  }

  keyCols = [];

  displayRecordData = [];

  keyColNames = [];
  showAllCols;
  columnFilters: object = {};
  refreshTimeout;


  ngOnChanges() {
    if (this.duration) {
      this.keyColNames = this.duration == 'live' ? ['sim_incident #', 'queue', 'full_insured_name', 'logged_as', 'submission', 'pending_reason', 'submission_status'] : ['date', 'sim_incident #', 'full_insured_name', 'logged_as', 'submission', 'producer_name', 'underwriter_name', 'pending_reason', 'submission_status'];
      this.keyColNames.forEach((col) => {
        this.columnFilters[col] = new GenericStringFilter(col);
      });

      this.keyCols = this.keyColNames.map((col) => {
        if (col) {
          let words;
          words = col.toString().split('_');
          words[0] = words[0].charAt(0).toUpperCase() + words[0].substr(1);
          if (words[1]) {
            words[1] = words[1].charAt(0).toUpperCase() + words[1].substr(1);
          }
          return words.join(' ');
        } else {
          return 'NA';
        }
      });
      this.refreshData();
    }
  }
  refreshData() {
    this.displayRecordData = [];

    const context = this._commonService.getContext();
    const dateFrom = (this.selectedDateFrom) ? this.formatClrDate(this.selectedDateFrom) : this._commonService.getToday();
    const dateTo = (this.selectedDateTo) ? this.formatClrDate(this.selectedDateTo) : this._commonService.getTomorrow();
    this._datasource.getData(context, this.duration, dateFrom, dateTo).subscribe((records) => {

      records.forEach(record => {
        record['sim_incident #'] = record['sim_incident'];
      });
      this.displayRecordData = records;

      if (this.duration == 'live') {
        if (records[0].sim_incident) {
          this.getLiveStatus(records[0].sim_incident)
        } else {
          this.selectedProcessEmitter.emit('');
        }

      }
    });

    this.refreshTimeout = setTimeout(() => {
      this.refreshData();
    }, 300000);
  }

  formatClrDate(date) {
    const dateArr = date.split('/'),
      month = dateArr[0],
      day = dateArr[1],
      year = dateArr[2]
      ;
    return year + '-' + month + '-' + day;
  }

  ngOnInit() {
    setTimeout(() => {
      document.querySelector('.datagrid-host')['style'] = '';
      document.querySelector('.datagrid-filter-toggle').addEventListener('click', function(){
        (<HTMLElement>document.querySelector('.datagrid-filter')).style.left = "100px";
        //filterBox.style.left = ""
      })
    }, 100);
  }



  onDateFromChange(val) {
    this.selectedDateFrom = val;
    if (this.validateDates()) {
      this.refreshData();
    }
  }

  onDateToChange(val) {
    this.selectedDateTo = val;
    if (this.validateDates()) {
      this.refreshData();
    }
  }

  validateDates(): boolean {
    if (!this.selectedDateFrom || !this.selectedDateTo) {
      return false;
    }
    const fromDate = new Date(this.formatClrDate(this.selectedDateFrom));
    const toDate = new Date(this.formatClrDate(this.selectedDateTo));

    if (isNaN(toDate.valueOf()) || isNaN(fromDate.valueOf())) {
      console.log('Invalid ' + toDate);
      return false;
    }

    if (fromDate > toDate) {
      const temp = this.selectedDateFrom;
      this.selectedDateFrom = this.dateFrom = this.selectedDateTo;
      this.selectedDateTo = this.dateTo = temp;
    }
    return true;
  }

  downloadExcel() {
    const dateFrom = (this.selectedDateFrom) ? this.formatClrDate(this.selectedDateFrom) : this._commonService.getToday();
    const dateTo = (this.selectedDateTo) ? this.formatClrDate(this.selectedDateTo) : this._commonService.getTomorrow();
    this._datasource.downloadExcel(this._commonService.getContext(), this.duration, dateFrom, dateTo).subscribe((filename) => {
      filename = filename.replace(/\"/g, '').replace(/\n/g, '');
      if (parseInt(filename) === 0) {
        return;
      }
      const getUrl = window.location;
      const baseUrl = getUrl.protocol + '//' + getUrl.host + '/' + getUrl.pathname.split('/')[0];
      window.open(baseUrl + 'static/' + this._commonService.getContext() + '/' + filename, '_blank');
    });
  }

  goToEnabler(incidentNum) {
    this._datasource.getEnablerFileName(this._commonService.getContext(), incidentNum).subscribe((filename) => {
      filename = filename.replace(/\"/g, '').replace(/\n/g, '');
      if (parseInt(filename) === 0) {
        alert("No file to download");
        return;
      }
      const getUrl = window.location;
      const baseUrl = getUrl.protocol + '//' + getUrl.host + '/' + getUrl.pathname.split('/')[0];
      window.open(baseUrl + 'static/' + this._commonService.getContext() + '/' + filename, '_blank');
    });
  }

  getLiveStatus(incidentNum) {
    this._datasource.getLiveStatus(this._commonService.getContext(), incidentNum).subscribe(state => {
      this.selectedProcessEmitter.emit(state.toString());
    })
  }

  ngOnDestroy() {
    clearTimeout(this.refreshTimeout);
  }
}
