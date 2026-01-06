export const formatCurrency = (amount: number | string) => {
    const num = Number(amount);
    if (isNaN(num)) return amount;

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(num);
};
