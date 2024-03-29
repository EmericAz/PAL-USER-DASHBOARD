import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { SUMMARY_DATA_KEY, USER_SESSION_KEY } from "src/app/Models/constants";
import { User } from "src/app/Models/models.interface";
import { BusinessService } from "src/app/services/business.service";

@Component({
  selector: "vex-curency-balance",
  templateUrl: "./curency-balance.component.html",
  styleUrls: ["./curency-balance.component.scss"],
})
export class CurencyBalanceComponent implements OnInit, OnDestroy {
  userData: User;
  balanceData: any;

  unsubscribe$ = new Subject();
  merchantSummaryData: any;
  constructor(private service: BusinessService) {
    const sessionData = JSON.parse(localStorage.getItem(USER_SESSION_KEY));
    this.userData = sessionData;
    const summaryData = JSON.parse(localStorage.getItem(SUMMARY_DATA_KEY));
    this.merchantSummaryData = summaryData;
  }

  ngOnInit(): void {
    this.getUserBalances();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getUserBalances() {
    this.service
      .getUserBalances(this.userData.user_id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: any) => {
        if (response.data.length) {
          const balanceDataMap = this.toMap(response.data);
          Object.keys(balanceDataMap).forEach(
            (currency) => {
              const balances = balanceDataMap[currency].map(data => data.balance);
              const result = balances
                ?.reduce((acc: any, cur: any) => {
                  return balanceDataMap[currency] = acc + Number(cur)
                }, 0) as number;
                return result.toFixed(2);
            }
          );
          this.balanceData = balanceDataMap;
        }
      });
  }

  private toMap(balanceData) {
    const result = balanceData.reduce(function (dataMap, item) {
      dataMap[item.currency] = dataMap[item.currency] || [];
      dataMap[item.currency].push(item);
      return dataMap;
    }, Object.create(null));

    return result;
  }
}
