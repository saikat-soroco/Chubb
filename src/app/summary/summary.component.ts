import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DatasourceService } from '../datasource.service';
import { CommonService } from '../common.service';
import 'nvd3';

const defaultStats = [
  {
    label: "---------",
    value: "0"
  },
  {
    label: "---------",
    value: "0"
  },
  {
    label: "---------",
    value: "0"
  },
  {
    label: "---------",
    value: "0"
  }
]

const colorRange: any[] = [
  { key: "green1", val: "#1ac7c1" },
  { key: "red", val: "#f2726f" },
  { key: "grey", val: "#87c890" },
  { key: "black", val: "#313467" }
];

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

  histogramOptions;
  histogramData;
  AFOptions;
  AFData;
  handlingTimeOptions;
  handlingTimeData;
  postProcessingTimeData;
  postProcessingTimeOptions;
  height = 250;
  dateFrom: string;
  dateTo: string;
  selectedDateFrom: string;
  selectedDateTo: string;
  isWorkOrderLoading: boolean;
  isAvgTimeLoading: boolean;

  statsPieChartData;
  statsPieChartOpts;
  isStatsLoading;

  basicStatsList = defaultStats;
  queryStatsList = defaultStats;

  

  constructor(private _activatedRoute: ActivatedRoute, private _datasource: DatasourceService, public _commonService: CommonService) {
    this._activatedRoute.params.subscribe((params) => {
      this._commonService.setContext(params['context']);
      this.initialize();
    });
  }
  ngOnInit() { }

  fetchStats() {
    this.basicStatsList = defaultStats;
    this.queryStatsList = defaultStats;

    this.isStatsLoading = true;
    let dateFrom = this.selectedDateFrom
      ? this.formatClrDate(this.selectedDateFrom)
      : this._commonService.getToday();
    let dateTo = this.selectedDateTo
      ? this.formatClrDate(this.selectedDateTo)
      : this._commonService.getTomorrow();

    this._datasource
      .fetchStats(this._commonService.getContext(), dateFrom, dateTo)
      .subscribe(data => {
        this.isStatsLoading = false;
        this.basicStatsList = data.total_summary.map(item => {
          if (typeof item.value == "number") {
            item.value = item.value.toLocaleString();
          }
          return item;
        });
        this.queryStatsList = data.status_summary.map(item => {
          if (typeof item.value == "number") {
            item.value = item.value.toLocaleString();
          }
          return item;
        });

        this.statsPieChartOpts = {
          chart: {
            type: "pieChart",
            height: 200,
            x: function (d) {
              return d.key;
            },
            y: function (d) {
              return d.y;
            },
            showLabels: false,
            duration: 500,
            labelThreshold: 0.01,
            labelSunbeamLayout: true,
            legend: {
              margin: {
                top: 5,
                right: 70,
                bottom: 5,
                left: 0
              }
            },
            color: (d, i) => {
              var index = i >= colorRange.length ? i % colorRange.length : i;
              if (d.color) {
                let item = colorRange.find(item => (item.key = d.color));
                return item || colorRange[index].val;
              } else {
                return colorRange[index].val;
              }
            }
          }
        };

        var totalSuccess = 0,
          totalFailed = 0;
        data[0].status_summary.forEach(dt => {
          switch (dt.label.toLowerCase()) {
            case "completed":
              totalSuccess = dt.value;
              break;
            case "exceptions":
              totalFailed = dt.value;
              break;
          }
        });

        this.statsPieChartData = [
          {
            key: "Success",
            y: totalSuccess
          },
          {
            key: "Failure",
            y: totalFailed
          }
        ];
      });
  }

  initialize() {
    this.fetchStats();
    this.isAvgTimeLoading = this.isWorkOrderLoading = true;

    const dateFrom = (this.selectedDateFrom) ? this.formatClrDate(this.selectedDateFrom) : this._commonService.addDays(new Date(), -7);
    const dateTo = (this.selectedDateTo) ? this.formatClrDate(this.selectedDateTo) : this._commonService.getToday();
    
    
    let ticksSS = false,
     showMaxMinSS = true,
     chartType = 'stackedAreaChart',
     tempData;

     

    console.log(showMaxMinSS, ticksSS, chartType)
    this._datasource.getSubmissionStatus(this._commonService.getContext(), dateFrom, dateTo)
      .subscribe((data) => {
        //debugger
        // tempData = data.length;
        this.histogramData = [{
          'color': '#64A737', 'key': 'Processed', 'values': data.map((dt) => {
            let currDate = Object.keys(dt)[0];
            if (!dt[currDate].PROCESSED) {
              dt[currDate].PROCESSED = 0;
            }

            return { 'x': Date.parse(this._commonService.adjustForTimezone(new Date(currDate)).toString()), 'y': dt[currDate].PROCESSED };
          })
        }, {
          'color': '#0078d2', 'key': 'Pending', 'values': data.map((dt) => {
            let currDate = Object.keys(dt)[0];
            if (!dt[currDate].PENDING) {
              dt[currDate].PENDING = 0;
            }

            return { 'x': Date.parse(this._commonService.adjustForTimezone(new Date(currDate)).toString()), 'y': dt[currDate].PENDING };
          })
        }, {
          'color': '#595959', 'key': 'In Progress', 'values': data.map((dt) => {
            let currDate = Object.keys(dt)[0];
            if (!dt[currDate]['IN PROGRESS']) {
              dt[currDate]['IN PROGRESS'] = 0;
            }
            return { 'x': Date.parse(this._commonService.adjustForTimezone(new Date(currDate)).toString()), 'y': dt[currDate]['IN PROGRESS'] };
          })
        }];
    });

    // tempData = tempData?tempData:1;
    if(dateTo == dateFrom){
      showMaxMinSS = false;
      ticksSS = false;
      chartType = 'scatterChart';
    // }else if(dateTo != dateFrom && tempData==1){
    //   showMaxMinSS = false;
    //   ticksSS = true;
    //   chartType = 'scatterChart';
    }else{
      showMaxMinSS = true;
      ticksSS = false;
      chartType = 'stackedAreaChart';
    }

    this.histogramOptions = {
      chart: {
        type: chartType,
        height: this.height,
        showControls: false,
        margin: {
          top: 80,
          right: 20,
          bottom: 45,
          left: 45
        },
        clipEdge: false,
        duration: 300,
        stacked: true,
        useInteractiveGuideline: true,
        xAxis: {
          axisLabel: 'Processing date',
          showMaxMin: showMaxMinSS,
          ticks: ticksSS,
          tickFormat: function (d) {
            const dt = (new Date(d)).toString().split(' ');
            return dt[1] + ' ' + dt[2];
          },
          autoSkip: false
        },
        reduceXTicks: false,
        yAxis: {
          axisLabel: 'Number of policies',
          axisLabelDistance: -15,
          tickFormat: function (d) {
            return '' + d;
          },
        }
      }
    };

    this._datasource.getAutomationFactor(this._commonService.getContext(), dateFrom, dateTo).subscribe(data => {
    
      let chartType = 'lineChart', xDomain, showMaxMin, ticks;
      if (data.length) {
        if (dateTo == dateFrom) {
          chartType = 'scatterChart';
          showMaxMin = false;
          ticks = true;
          xDomain = [
            Date.parse(this._commonService.adjustForTimezone(new Date(dateFrom + 'T00:00:01Z')).toString()),
            Date.parse(this._commonService.adjustForTimezone(new Date(dateTo + 'T23:59:00Z')).toString())
          ];

        }else if(dateTo != dateFrom && data.length==1){
          chartType = 'scatterChart';
          showMaxMin = false;
          ticks = true;
           /* adjust date values*/
           let beforeDate = function (date, status=true){
            let dt = date.toString().split('-');
            let reducer = Number(dt[2]) - 1
            console.log(dt[0] + "-" + dt[1] + "-" + reducer);
            return dt[0] + "-" + dt[1] + "-" + reducer;
          }
          let afterDate = function (date, status=true){
            let dt = date.toString().split('-');
            let reducer = Number(dt[2]) + 1
            console.log(dt[0] + "-" + dt[1] + "-" + reducer);
            return dt[0] + "-" + dt[1] + "-" + reducer;
          }
          let newDateFrom = beforeDate(dateFrom);
          let newDateTo = afterDate(dateFrom);

          xDomain = [
            Date.parse((new Date(dateTo)).toString()) + ((dateFrom == dateTo) ? 1 : 0),
            Date.parse((new Date(dateFrom)).toString())
            //Date.parse(this._commonService.adjustForTimezone(new Date(dateTo + 'T23:59:00Z')).toString())
          ];

        }
        else {
          showMaxMin = true;
          ticks = false;
          xDomain = [
            Date.parse(this._commonService.adjustForTimezone(new Date(dateFrom)).toString()),
            Date.parse(this._commonService.adjustForTimezone(new Date(dateTo)).toString()) + ((dateFrom == dateTo) ? 1 : 0)
          ];

          // console.log(data)
          // console.log("------------------------")
          // console.log(xDomain)
        }

      }

      this.AFOptions = {
        chart: {
          type: chartType,
          height: this.height,
          xDomain: xDomain,
          yDomain: [0, 1],
          showLegend: false,
          showControls: false,
          
          clipEdge: false,
          padData: true,
          padDataOuter: 0.1,
          margin: {
            top: 30,
            right: 20,
            bottom: 45,
            left: 45
          },
          x: function (d) { return d.x; },
          y: function (d) { return d.y; },
          // useInteractiveGuideline: true,
          duration: 300,
          xAxis: {
            axisLabel: '',
            ticks: ticks,
            showMaxMin:showMaxMin,
            tickFormat: function (d) {
              const dt = (new Date(d)).toString().split(' ');
              //console.log(dt)
              return dt[1] + ' ' + dt[2];
            },
            autoSkip: false
          },
          reduceXTicks: false,
          yAxis: {
            axisLabel: 'Processed policy %',
            axisLabelDistance: -15,
            tickFormat: function (d) {
              return d3.format(',.0f')(d * 100) + '%';
            }

          }
        }
      };

      this.AFData = [{
        area: true, 'color': 'rgb(0, 120, 210)', 'key': 'Processed', 'values':
          data.map((newDate) => {
            //console.log("Map= ",newDate)
            return {
              'x': Date.parse(this._commonService.adjustForTimezone(new Date(newDate.date)).toString()), 'y': (newDate.automation_factor / 100).toFixed(2)
            };
          })
      }];



      setTimeout(() => {
        this.isWorkOrderLoading = false;
      });
    });

    this._datasource.getAveragehandlingTime(this._commonService.getContext(), dateFrom, dateTo)
      .subscribe((data) => {

        /* let data = [];
        data =[
          {
            "started_at": "07/19/2018",
            "handling_time": -8.17647058823529
          },
          {
            "started_at": "07/21/2018",
            "handling_time": 0
          },
          {
            "started_at": "07/20/2018",
            "handling_time": -9.2
          }
        ]; */

        // let  data = JSON.parse(`[{"date": "2018-09-17", "avg": 32.088715783333335}, {"date": "2018-09-18", "avg": 13.058007583333334}, {"date": "2018-09-19", "avg": 33.48531461666667}]`)
        //   console.log(data);

        let m = 0;
        let showMaxMinAHT;
        let chartType = 'lineChart', xDomain, ticksAHT;
        if (data.length) {
          if (dateTo == dateFrom) {
            chartType = 'scatterChart';
            showMaxMinAHT = false;
            ticksAHT = true;
            xDomain = [
              Date.parse(this._commonService.adjustForTimezone(new Date(dateFrom + 'T00:00:01Z')).toString()),
              Date.parse(this._commonService.adjustForTimezone(new Date(dateTo + 'T23:59:00Z')).toString())
            ];

            data[0] = {
              date: dateFrom + 'T12:00:00Z',
              avg: data[0].avg
            };

          } else if(dateTo != dateFrom && data.length==1){
            chartType = 'scatterChart';
            ticksAHT = true;
            showMaxMinAHT = false;
             /* adjust date values*/
             let beforeDate = function (date, status=true){
              let dt = date.toString().split('-');
              let reducer = Number(dt[2]) - 1
              console.log(dt[0] + "-" + dt[1] + "-" + reducer);
              return dt[0] + "-" + dt[1] + "-" + reducer;
            }
            let afterDate = function (date, status=true){
              let dt = date.toString().split('-');
              let reducer = Number(dt[2]) + 1
              console.log(dt[0] + "-" + dt[1] + "-" + reducer);
              return dt[0] + "-" + dt[1] + "-" + reducer;
            }
            let newDateFrom = beforeDate(dateFrom);
            let newDateTo = afterDate(dateFrom);

            xDomain = [
              Date.parse((new Date(dateTo)).toString()) + ((dateFrom == dateTo) ? 1 : 0),
              Date.parse((new Date(dateFrom)).toString())
              //Date.parse(this._commonService.adjustForTimezone(new Date(dateTo + 'T23:59:00Z')).toString())
            ];

          }
          else {
            showMaxMinAHT = true;
            ticksAHT = false;
            xDomain = [
              Date.parse(this._commonService.adjustForTimezone(new Date(dateFrom)).toString()),
              Date.parse(this._commonService.adjustForTimezone(new Date(dateTo)).toString()) + ((dateFrom == dateTo) ? 1 : 0)
            ];

            // if (data[0].processing_date != dateFrom) {
            //   data.unshift({
            //     date: this.formatClrDate(this.dateFrom),
            //     avg: 0
            //   });
            // }

            // if (data[data.length - 1].date != dateTo) {
            //   data.push({
            //     date: this.formatClrDate(this.dateTo),
            //     avg: 0
            //   });
            // }

          }
          //console.log(data);
          //let timeScale = d3.time.scale().domain([new Date(dateFrom), new Date(dateTo)]).range([0, data.length-1]);
          //console.log(timeScale);


          this.handlingTimeData = [{
            'color': 'rgb(252, 153, 4)', 'key': 'Handling time', 'values': data.map((row) => {
              return { 'x': Date.parse(this._commonService.adjustForTimezone(new Date(row.date)).toString()), 'y': row.avg };
            })
          }];
          m = this.handlingTimeData[0]['values'].reduce((acc, val) => {
            return acc.y > val.y ? acc : val;
          }).y;
        } else {
          this.handlingTimeData = [];
        }

        this.handlingTimeOptions = {
          chart: {
            type: chartType,
            height: this.height,
            xDomain: xDomain,
            yDomain: [0, Math.floor(m + 10)],
            showLegend: false,
            showControls: false,
            clipEdge: false,
            
            interpolate: 'linear',
            padData: true,
            padDataOuter: 0.1,
            margin: {
              top: 30,
              right: 20,
              bottom: 45,
              left: 45
            },
            x: function (d) { return d.x; },
            y: function (d) { return d.y; },
            // useInteractiveGuideline: true,
            duration: 300,
            //xScale: d3.time.scale().domain([new Date(dateFrom), new Date(dateTo)]).range([0, data.length-1]),
            xAxis: {
              ticks: ticksAHT,
              showMaxMin:showMaxMinAHT,
              axisLabel: '',
              tickFormat: function (d) {
                const dt = (new Date(d)).toString().split(' ');
                //console.log(dt[1] + ' ' + dt[2])
                return dt[1] + ' ' + dt[2];
              },
              autoSkip: false
            },
            reduceXTicks: false,
            yAxis: {
              axisLabel: 'Handling Time (mins)',
              axisLabelDistance: -15,
              autoSkip: false
            },
            reduceYTicks: false,
          }
        };

        setTimeout(() => {
          this.isAvgTimeLoading = false;
        });
      });

    // this._datasource.getPostProcessingTime(this._commonService.getContext(), dateFrom, dateTo).subscribe((data) => {
    //   this.postProcessingTimeData = [{
    //     'color': 'rgb(252, 153, 4)', 'key': 'Post processing time', 'values': data.map((row) => {
    //       return { 'x': Date.parse(row.processing_date), 'y': row.avg };
    //     })
    //   }];

    //   const m = this.postProcessingTimeData[0]['values'].reduce((acc, val) => {
    //     return acc.y > val.y ? acc : val;
    //   }).y;
    //   this.postProcessingTimeOptions = {
    //     chart: {
    //       type: 'lineChart',
    //       height: this.height,
    //       yDomain: [0, m + 10],
    //       showLegend: false,
    //       showControls: false,
    //       margin: {
    //         top: 30,
    //         right: 20,
    //         bottom: 45,
    //         left: 45
    //       },
    //       x: function (d) { return d.x; },
    //       y: function (d) { return d.y; },
    //       useInteractiveGuideline: true,
    //       duration: 300,
    //       xAxis: {
    //         axisLabel: '',
    //         tickFormat: function (d) {
    //           const dt = (new Date(d)).toString().split(' ');
    //           return dt[1] + ' ' + dt[2];
    //         },
    //         autoSkip: false
    //       },
    //       reduceXTicks: false,
    //       yAxis: {
    //         axisLabel: 'Handling Time (min)',
    //         axisLabelDistance: -15
    //       },
    //     }
    //   };
    // });

  }

  onDateFromChange(val) {
    this.selectedDateFrom = val;
    if (this.validateDates()) {
      console.log('refresh triggered');
      this.initialize();
    }
  }

  onDateToChange(val) {
    this.selectedDateTo = val;
    if (this.validateDates()) {
      console.log('refresh triggered');
      this.initialize();
    }
  }

  formatClrDate(date) {
    if (date == undefined) {
      console.log("No date Entered");
    } else {
      let dateArr = date.split('/'),
        month = dateArr[0],
        day = dateArr[1],
        year = dateArr[2]
        ;
      return year + '-' + month + '-' + day;
    }
  }

  // defaultDate(substractDate, date){
  //   let currentDate = (new Date()).toString().split(" ");
  //   if(substractDate > 0){
  //     currentDate[2] = (Number(currentDate[2]) - 7).toString();
  //   }
  //   return currentDate
  // }

  validateDates(): boolean {
    console.log("before validation", this.selectedDateFrom, this.selectedDateTo, this.dateFrom, this.dateTo);
    if (!this.selectedDateFrom || !this.selectedDateTo) {
      return false;
    }

    if (!this.selectedDateFrom && !this.selectedDateTo) {
      console.log("after validation", this.selectedDateFrom, this.selectedDateTo, this.dateFrom, this.dateTo);
    }

    let fromDate = new Date(this.formatClrDate(this.selectedDateFrom));
    let toDate = new Date(this.formatClrDate(this.selectedDateTo));

    if (isNaN(toDate.valueOf()) || isNaN(fromDate.valueOf())) {
      console.log('Invalid ' + toDate);
      return false;
    }

    if (fromDate > toDate) {
      let temp = this.selectedDateFrom;
      this.selectedDateFrom = this.dateFrom = this.selectedDateTo;
      this.selectedDateTo = this.dateTo = temp;
    }
    return true;
  }
}
