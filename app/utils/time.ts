export const deltatime = (origin: Date, comp: Date = new Date(), replace: string[] = ["aujourd'hui", "hier"], useDateFrom: number = 7): string => {
	origin = new Date(origin);
	comp = new Date(comp);

	const duration = (comp.getTime() - origin.getTime()) / (1000 * 60 * 60 * 24);

	const hours = Math.floor(duration * 24);
	const minutes = Math.floor((duration * 24 - hours) * 60);

	if (duration >= useDateFrom) {
		return origin.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: duration > 365 ? 'numeric' : undefined });
	} else if (duration < 1) {
		if (hours < 1) {
			if (minutes < 1) {
				return "À l'instant";
			} else {
				return `${minutes} min`;
			}
		} else {
			return `${hours}h`;
		}
	} else if (duration >= replace.length) {
		return `${Math.floor(duration)} jours`;
	} else {
		return replace[Math.floor(duration)]!;
	}
}
