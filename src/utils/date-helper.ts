export const getBusinessDaysDifference = (startDate: Date, endDate: Date): number => {
  let count = 0;
  const curDate = new Date(startDate.getTime());
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Domingo, 6 = Sábado
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count -1; // Subtrai 1 para não contar o dia inicial
};