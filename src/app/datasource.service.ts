import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/map';

import { CommonService } from './common.service';
import { reject } from 'q';
@Injectable()
export class DatasourceService {

  constructor(private _http: Http, private _commonService: CommonService) {

  }

  getStyleSheet() {
    return this._http.get('/v1.0/api/data/32/row?no-cached=true');
  }
  getLoggedinUser() {
    return this._http.get('/v1.0/api/user/loggedin-user').map((response) => {
      return response.json();
    });
  }

  getTodaysWorkOrder(context, dateFrom: string, dateTo: string) {
    // return this._http.get('/assets/mock-data/todays-data.json').map(res => res.json());
    return this._http.get('/v1.0/api/v1.0/api/data/14/row?no-cached=true&book_type=' + context.toLowerCase() + '&start_date=' + dateFrom + '&end_date=' + dateTo).map((response) => {
      return response.json();
    });
  }

  getData(context, duration, dateFrom: string, dateTo: string) {
    return this._http.get('/v1.0/api/data/' + context + '_' + duration + '_data/row?no-cached=true&' + '&start_date=' + dateFrom + '&end_date=' + dateTo).map((response) => {
      return response.json();
    });
  }

  getLiveStatus(context, incidentNum) {
    return this._http.get('/v1.0/api/data/' + context + '_live_status/row?no-cached=true&incident_number=' + incidentNum).map((response) => {
      return response.text();
    });
  }

  getEnablerFileName(context, incidentNum) {
    return this._http.get('/v1.0/api/data/' + context + '_retrieve_enabler/row?no-cached=true&reference_number=' + incidentNum).map((response) => {
      return response.text();
    });
  }

  getAutomationFactor(context, dateFrom: string, dateTo: string) {
    
    return this._http.get('/v1.0/api/data/' + context + '_automation_factor/row?no-cached=true&start_date='
      + dateFrom + '&end_date=' + dateTo).map((response) => {
        return response.json();
      });
 
  }

  getSubmissionStatus(context, dateFrom: string, dateTo: string): Observable<any> {

    return this._http.get('/v1.0/api/data/' + context + '_submisison_status/row?no-cached=true&start_date='
      + dateFrom + '&end_date=' + dateTo).map((response) => {
        return response.json();
      });
  }

  getAveragehandlingTime(context, dateFrom: string, dateTo: string) {
    /* if (dateFrom == dateTo) {
      return of([
        {
          processing_date: '2018-05-15',
          avg: 12
        }
      ]);
    } else {
      return of([
        {
          processing_date: '2018-05-09',
          avg: 5
        },
        {
          processing_date: '2018-05-13',
          avg: 12
        },
        {
          processing_date: '2018-05-15',
          avg: 20
        }
      ]);
    } */
    // let data = JSON.parse(`[{"date": "2018-09-17", "avg": 32.088715783333335}, {"date": "2018-09-18", "avg": 13.058007583333334}, {"date": "2018-09-19", "avg": 33.48531461666667}]`)
    // console.log(data)
    

    // return data;

    return this._http.get('/v1.0/api/data/' + context + '_aht/row?no-cached=true&start_date=' + dateFrom + '&end_date=' + dateTo).map((response) => {
      return response.json();
    });
  }

  getPostProcessingTime(context, dateFrom: string, dateTo: string) {
    return this._http.get('/v1.0/api/v1.0/api/data/15/row?no-cached=true&book_type=' + context.toLowerCase() + '&start_date=' + dateFrom + '&end_date=' + dateTo).map((response) => {
      return response.json();
    });
  }

  fetchStats(context, dateFrom: string, dateTo: string): Observable<any> {
    return this._http.get("/v1.0/api/data/29/row-staging?no-cached=true" + '&start_date=' + dateFrom + '&end_date=' + dateTo)
      .map(response => response.json());
  }

  downloadExcel(context, duration, dateFrom: string, dateTo: string) {
    return this._http.get('/v1.0/api/data/' + context + '_' + duration + '_data_excel/row?no-cached=true&start_date=' + dateFrom + '&end_date=' + dateTo).map((response) => {
      return response.text();
    });
  }

}
