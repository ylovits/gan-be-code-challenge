export interface Address {
	guid: string;
	isActive: boolean;
	address: string;
	latitude: number;
	longitude: number;
	tags: string[];
}

export interface AreaCalculation {
	id: string;
	address_id: string;
	distance: number;
	status: string;
	result: Address[];
	created_at: Date;
	updated_at: Date;
}
