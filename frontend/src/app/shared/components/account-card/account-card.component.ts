import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Account } from '../../../core/models';
import { getAccountMeta } from '../../utils/account-type.util';

@Component({
  selector: 'app-account-card',
  standalone: true,
  imports: [CurrencyPipe, MatIconModule],
  templateUrl: './account-card.component.html',
  styleUrl: './account-card.component.scss'
})
export class AccountCardComponent {
  @Input({ required: true }) account!: Account;
  @Input() compact = false;
  @Output() delete = new EventEmitter<number>();

  get meta() {
    return getAccountMeta(this.account.accountType);
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.account.id);
  }
}
