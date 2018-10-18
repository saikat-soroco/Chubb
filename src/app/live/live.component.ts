import { Component, OnInit } from '@angular/core';
import { DatasourceService } from '../datasource.service';
import { CommonService } from '../common.service';
import 'nvd3';

@Component({
  selector: 'app-live',
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.css']
})
export class LiveComponent implements OnInit {

  constructor(private _datasourceService: DatasourceService, private _commonService: CommonService) { }
  retailProgressSteps = ['Picked up from SIM', 'Searching in Genius', 'Searching in CUW', 'Logging submission', 'Adding submission details in CUW', 'Updating SIM'];
  wspProgressSteps = ['Searching in SIM', 'Searching in Genius', 'Logging submission', 'Updating SIM'];
  //progressSteps = ['Picked up from SIM', 'Searching in Genius', 'Searching in CUW', 'Logging submission', 'Adding submission details in CUW', 'Updating SIM'];
  progressSteps = [];
  status = -1;
  histogramData = [];
  histogramOptions = {
    chart: {
      type: 'multiBarChart',
      height: 300,
      showControls: false,
      margin: {
        top: 80,
        right: 20,
        bottom: 45,
        left: 45
      },
      clipEdge: true,
      duration: 300,
      stacked: false,
      xAxis: {
        axisLabel: 'Process Status',
        showMaxMin: false,
        ticks: false,
        tickFormat: function (d) {
          return ['Processed', 'Pending', 'In Progress'][d];
        },
        autoSkip: false
      },
      reduceXTicks: false,
      yAxis: {
        axisLabel: 'Volume',
        axisLabelDistance: -15,
        tickFormat: function (d) {
          return '' + d;
        },
      }
    }
  };

  isLoading = true;

  ngOnInit() {
    if(this._commonService.getContext() === 'wsp'){
      this.progressSteps = this.wspProgressSteps;
    }else{
      this.progressSteps = this.retailProgressSteps;
    }
    this._datasourceService.getSubmissionStatus(this._commonService.getContext(), this._commonService.getToday(), this._commonService.getTomorrow()).subscribe(data => {
      
      if (data.length == 0) {
        setTimeout(() => {
          this.isLoading = false;
        });
        return;
      }

      const dt = Object.keys(data[0])[0];
      this.histogramData = ['Processed', 'Pending', 'In Progress'].map((state, index) => {
        return {
          'color': '#007CBB', 'key': state, 'values': [{ 'x': index, 'y': data[0][dt][state.toUpperCase()] ? data[0][dt][state.toUpperCase()] : 0 }]
        };
      });
      setTimeout(() => {
        this.isLoading = false;
      });
    });
  }

  setState(currentState) {
    currentState = currentState.replace(/\"/g, '').replace(/\n/g, '');
    this.status = this.progressSteps.findIndex(state => {
      return state.toLowerCase() === currentState.toLowerCase();
    });
  }

}
