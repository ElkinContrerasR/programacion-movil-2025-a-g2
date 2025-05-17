import { Component, Input, OnInit } from '@angular/core';
import {IonicModule} from '@ionic/angular';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  imports:[ IonicModule]
})
export class ButtonComponent  implements OnInit {

  @Input() color: string = 'primary';

  constructor() { }

  ngOnInit() {}

}
