



function BonusList() {
	this.bonuses = [

	new bonusCreateVillages(),
	new bonusCreateWaterDens(),
	new bonusMoveCities(),
	new bonusCreateExpedition()


	];
}

BonusList.prototype.bonusNameList = function() {
	return this.bonuses.filter(bonus => bonus.name);
}

BonusList.prototype.bonusAvailable = function(world) {
	for (let bonus of this.bonuses) {
		if (bonus.activation(world) && !bonus.enabled)
			return true;
	}
	return false;
}

BonusList.prototype.bonusEnabled = function(bonus_name) {
	let bonus = this.getBonus(bonus_name);
	return (bonus && bonus.enabled);
}

BonusList.prototype.getBonus = function(bonus_name) {
	for (bonus of this.bonuses) {
		if (bonus.name == bonus_name)
			return bonus;
	}
	return false;
}

BonusList.prototype.getBonuses = function() {
	return this.bonuses;
}

BonusList.prototype.getBonusesAvailable = function(world) {
	return this.bonuses.filter(bonus => (!bonus.enabled && bonus.activation(world)));
}

BonusList.prototype.enableBonus = function(bonus_name, world) {
	let bonus = this.getBonus(bonus_name);

	if (bonus) {
		bonus.enabled = true;
		bonus.effect(world);
	}
}







function Bonus() {
	this.name = 'generic-bonus';
	this.description = 'Generic bonus';
	this.extra_description = '';
	this.enabled = false;

	this.getDescription = function() {
		return this.description;
	}

		this.getExtraDescription = function() {
		return this.extra_description;
	}

	this.requirement = function(world) {

		if (this.min_collected && world.resources_collected < this.min_collected)
			return false;
		
		return this.activation(world);
	}

	this.activation = function(world) {
		return true;
	}

	this.effect = function(world) {

	}
}







function bonusCreateVillages() {
	Bonus.call(this);
	this.name = 'can-create-villages';
	this.description = "Tunneling";
	this.min_collected = 2;


}


function bonusCreateWaterDens() {
	Bonus.call(this);
	this.name = 'can-create-waterdens';
	this.description = "Amphibious";
	this.min_collected = 2;


}


function bonusMoveCities() {
	Bonus.call(this);
	this.name = 'moveable-cities';
	this.description = "Nomadic Hives";
	this.min_collected = 6;

}

function bonusCreateExpedition() {
	Bonus.call(this);
	this.name = 'expedition-centers';
	this.description = "Exploration";
	this.min_collected = 10;

}



