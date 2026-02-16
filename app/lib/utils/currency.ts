const idrFormatter = new Intl.NumberFormat("id-ID", {
	style: "currency",
	currency: "IDR",
	minimumFractionDigits: 0,
	maximumFractionDigits: 0,
});

export function formatIDR(amount: number): string {
	return idrFormatter.format(amount);
}

export function parseIDR(value: string): number {
	const cleaned = value.replace(/[^\d,-]/g, "").replace(",", ".");
	return Number(cleaned) || 0;
}
