import { Component, Input, OnChanges, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-progress-step',
  templateUrl: './progress-step.component.html',
  styleUrls: ['./progress-step.component.css']
})
export class ProgressStepComponent implements OnChanges, AfterViewChecked {

  @ViewChild('stepContainer') stepContainer: ElementRef;
  @Input() status: any;
  @Input() progressSteps: any;
  progressStepData: any = [];
  connectorWidth = 'auto';
  constructor(private cdr: ChangeDetectorRef) { }



  ngOnChanges(change: any) {
    if (this.progressSteps) {
      this.progressStepData = this.progressSteps.map((status, index, array) => {
        return {
          step_name: status,
          step_status: false
        };
      });
      if (this.status !== undefined && this.status !== null) {
        this.progressStepData = this.progressSteps.map((status, index, array) => {
          return {
            step_name: status,
            step_status: index <= this.status ? true : false
          };
        });
      }
    }
  }

  ngAfterViewChecked() {
    this.connectorWidth = this.getConnectorWidth();
    this.cdr.detectChanges();
  }

  getConnectorWidth() {
    const elWidth = this.stepContainer.nativeElement.getBoundingClientRect().width;
    const connectors = this.progressStepData.length + 1;
    const index = this.status;
    const tempWidth = Math.ceil((elWidth - ((this.progressStepData.length) * 35)) / connectors);
    return (tempWidth - 10) > 0 ? (tempWidth - 10) + 'px' : '173px';
  }
}
