# Membres groupe:
- RAZAFINIMANANA Hajaina Andonirina ETU002752
- RAVELOMANANTSOA Sergiana Francourt ETU002610
# Présentation de l'application
## Listes fonctionnalités
### Back-office
#### Admin
- Dashboard montrant des données clé pour l'admin
- Création et liste de type produit
- Création et liste de type magasin
- Création et liste de box, espace pour les magasins, avec la configuration des loyers et historique
- Assignation de box pour un magasin
- Création de paiement loyer d'un magasin et liste des paiements effectué
- Suivi de paiement de loyer des magasin
- Création de magasin et liste
- Creation et liste utilisateur 
#### Boutique
- Liste de type produit
- Paiement loyer pour son magasin et liste de ses paiements
- Suivi et gestion de stocke des produits
- Création produit
- Création promotions
- Liste des avis sur les produits
- Liste des avis sur le magasins
        - 
# Structure mongo db de l'application
```json
{
	"database": "m1p13mean-sergiana-hajaina",
	"collections": {
		"users": {
			"model": "User",
			"timestamps": true,
			"fields": {
				"name": { "type": "String", "required": true },
				"email": { "type": "String", "required": true, "unique": true },
				"password": { "type": "String", "required": true },
				"role": {
					"type": "String",
					"enum": ["CLIENT", "BOUTIQUE", "ADMIN"],
					"default": "CLIENT"
				}
			},
			"indexes": [{ "field": "email", "unique": true }]
		},
		"typeMagasins": {
			"model": "TypeMagasin",
			"timestamps": false,
			"fields": {
				"nomTypeMagasin": { "type": "String", "required": true }
			},
			"indexes": []
		},
		"typeProduits": {
			"model": "TypeProduit",
			"timestamps": false,
			"fields": {
				"nomTypeProduit": { "type": "String", "required": true }
			},
			"indexes": []
		},
		"unites": {
			"model": "Unite",
			"timestamps": false,
			"fields": {
				"nomUnite": { "type": "String", "required": true }
			},
			"indexes": []
		},
		"magasins": {
			"model": "Magasin",
			"timestamps": true,
			"fields": {
				"nomMagasin": { "type": "String", "required": true, "unique": true },
				"dateAjout": { "type": "Date", "default": "Date.now" },
				"nif": { "type": "String" },
				"stat": { "type": "String" },
				"appUser": { "type": "ObjectId", "ref": "User", "required": true },
				"typeMagasin": { "type": "ObjectId", "ref": "TypeMagasin", "required": true }
			},
			"indexes": [{ "field": "nomMagasin", "unique": true }]
		},
		"boxes": {
			"model": "Box",
			"timestamps": false,
			"fields": {
				"nomBox": { "type": "String", "required": true },
				"aireBox": { "type": "Number", "required": true }
			},
			"indexes": []
		},
		"magasinboxes": {
			"model": "MagasinBox",
			"timestamps": true,
			"fields": {
				"magasin": { "type": "ObjectId", "ref": "Magasin", "required": true },
				"box": { "type": "ObjectId", "ref": "Box", "required": true },
				"dateDebut": { "type": "Date", "required": true },
				"dateFin": { "type": "Date" }
			},
			"indexes": [{ "fields": { "magasin": 1, "box": 1 }, "unique": true }]
		},
		"loyerboxes": {
			"model": "LoyerBox",
			"timestamps": true,
			"fields": {
				"montantLoyer": { "type": "Number", "required": true },
				"dateDebut": { "type": "Date", "required": true },
				"dateFin": { "type": "Date" },
				"box": { "type": "ObjectId", "ref": "Box", "required": true }
			},
			"indexes": []
		},
		"paiementloyers": {
			"model": "PaiementLoyer",
			"timestamps": true,
			"fields": {
				"magasin": { "type": "ObjectId", "ref": "Magasin", "required": true, "index": true },
				"mois": { "type": "Number", "required": true, "min": 1, "max": 12 },
				"annee": { "type": "Number", "required": true, "min": 1900 },
				"datePaiement": { "type": "Date", "required": true, "default": "Date.now" },
				"montantPaye": { "type": "Number", "required": true, "min": 0 },
				"details": {
					"type": "Array",
					"itemSchema": {
						"box": { "type": "ObjectId", "ref": "Box", "required": true },
						"loyerBox": { "type": "ObjectId", "ref": "LoyerBox", "required": true },
						"montantLoyer": { "type": "Number", "required": true, "min": 0 }
					}
				}
			},
			"indexes": [
				{ "fields": { "magasin": 1, "mois": 1, "annee": 1 }, "unique": true },
				{ "fields": { "details.box": 1, "annee": 1, "mois": 1 }, "unique": false }
			]
		},
		"produits": {
			"model": "Produit",
			"timestamps": true,
			"fields": {
				"nomProduit": { "type": "String", "required": true, "unique": true },
				"descriptionProduit": { "type": "String" },
				"seuilNotification": { "type": "Number" },
				"photos": {
					"type": "Array",
					"itemSchema": {
						"url": { "type": "String" },
						"dateAjout": { "type": "Date" }
					}
				},
				"unite": { "type": "ObjectId", "ref": "Unite", "required": true },
				"typeProduit": { "type": "ObjectId", "ref": "TypeProduit", "required": true },
				"magasin": { "type": "ObjectId", "ref": "Magasin", "required": true }
			},
			"indexes": [{ "field": "nomProduit", "unique": true }]
		},
		"prixproduits": {
			"model": "PrixProduit",
			"timestamps": true,
			"fields": {
				"prixUnitaire": { "type": "Number", "required": true },
				"dateDebut": { "type": "Date", "required": true },
				"dateFin": { "type": "Date" },
				"produit": { "type": "ObjectId", "ref": "Produit", "required": true }
			},
			"indexes": []
		},
		"promotions": {
			"model": "Promotion",
			"timestamps": true,
			"fields": {
				"qte": { "type": "Number", "default": -1 },
				"pourcentage": { "type": "Number", "default": 0 },
				"dateDebut": { "type": "Date", "required": true },
				"dateFin": { "type": "Date", "required": true },
				"produit": { "type": "ObjectId", "ref": "Produit" },
				"magasin": { "type": "ObjectId", "ref": "Magasin" }
			},
			"indexes": []
		},
		"mvtstocks": {
			"model": "MvtStock",
			"timestamps": true,
			"fields": {
				"qteEntree": { "type": "Number", "default": 0 },
				"qteSortie": { "type": "Number", "default": 0 },
				"dateMvtStock": { "type": "Date" },
				"unite": { "type": "ObjectId", "ref": "Unite", "required": true },
				"produit": { "type": "ObjectId", "ref": "Produit", "required": true }
			},
			"indexes": []
		},
		"paniers": {
			"model": "Panier",
			"timestamps": true,
			"fields": {
				"qte": { "type": "Number", "default": 1 },
				"produit": { "type": "ObjectId", "ref": "Produit" },
				"appUser": { "type": "ObjectId", "ref": "User", "required": true }
			},
			"indexes": []
		},
		"favoris": {
			"model": "Favoris",
			"timestamps": true,
			"fields": {
				"dateAjout": { "type": "Date", "required": true },
				"produit": { "type": "ObjectId", "ref": "Produit" },
				"appUser": { "type": "ObjectId", "ref": "User", "required": true }
			},
			"indexes": []
		},
		"avisproduits": {
			"model": "AvisProduit",
			"timestamps": true,
			"fields": {
				"dateAjout": { "type": "Date", "required": true },
				"commentaire": { "type": "String" },
				"nombreEtoile": { "type": "Number", "default": 0 },
				"produit": { "type": "ObjectId", "ref": "Produit" },
				"appUser": { "type": "ObjectId", "ref": "User", "required": true }
			},
			"indexes": []
		},
		"avismagasins": {
			"model": "AvisMagasin",
			"timestamps": true,
			"fields": {
				"dateAjout": { "type": "Date", "required": true },
				"commentaire": { "type": "String" },
				"nombreEtoile": { "type": "Number", "default": 0 },
				"magasin": { "type": "ObjectId", "ref": "Magasin" },
				"appUser": { "type": "ObjectId", "ref": "User", "required": true }
			},
			"indexes": []
		},
		"ventes": {
			"model": "Vente",
			"timestamps": true,
			"fields": {
				"magasin": { "type": "ObjectId", "ref": "Magasin", "required": true },
				"appUser": { "type": "ObjectId", "ref": "User", "required": true },
				"dateVente": { "type": "Date", "default": "new Date()" },
				"pourcentagePromotion": { "type": "Number", "default": 0 },
				"totalPrix": { "type": "Number" }
			},
			"indexes": []
		},
		"ventedetails": {
			"model": "VenteDetail",
			"timestamps": true,
			"fields": {
				"qte": { "type": "Number", "default": 0 },
				"prixUnitaire": { "type": "Number", "default": 0 },
				"pourcentagePromotion": { "type": "Number", "default": 0 },
				"prixTotal": { "type": "Number", "default": 0 },
				"vente": { "type": "ObjectId", "ref": "Vente", "required": true },
				"produit": { "type": "ObjectId", "ref": "Produit", "required": true }
			},
			"indexes": []
		}
	}
}
```


