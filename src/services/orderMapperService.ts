import { StatusTimeline } from '../types/order';

export class OrderMapperService {
  static createStatusTimeline(orderDate: string): StatusTimeline {
    return {
      confirmacao: this.addDays(orderDate, 1),
      preparacao: this.addDays(orderDate, 2),
      expedicao: this.addDays(orderDate, 3),
      transito: this.addDays(orderDate, 4),
      entrega: this.addDays(orderDate, 7),
      concluido: this.addDays(orderDate, 10)
    };
  }

  public static addDays(date: string, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static calculateExpectedDelivery(invoiceDate: string): Date {
    return this.addDays(invoiceDate, 7);
  }

  static calculateTotalValue(documentsCount: number): number {
    return 5000 + (documentsCount * 2500);
  }

  static formatCurrency(value: number): string {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
}