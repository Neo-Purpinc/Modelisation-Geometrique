"use strict"

function mix(a,b,k)
{
	return a.scalarmult(1-k).add(b.scalarmult(k));
}
function decalZ(f)
{
 return f.phi2.phi1.phi1.phi2.phi1
}
function print_commands()
{
	ewgl.console.clear();
	ewgl.console.info_nl("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
	ewgl.console.info_nl("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ RAPPEL DES COMMANDES @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
	ewgl.console.info_nl("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
	ewgl.console.info_nl("@ 't' : trianguler les faces\t\t\t\t| 'e' : flipper l'arête courante\t\t @");
	ewgl.console.info_nl("@ 'c' : couper l'arête courante\t\t\t\t| 'd' : couper la face courante\t\t\t @");
	ewgl.console.info_nl("@ 'v' : calculer la valence du sommet courant\t\t| 'f' : calculer la valence de la face courante\t @");
	ewgl.console.info_nl("@--------------------------------------------------------------------------------------------------------@");
	ewgl.console.info_nl("@ '+' : sélectionner le brin suivant\t\t\t| '-' : sélectionner le brin précédent\t\t @");
	ewgl.console.info_nl("@ '<' : sélectionner l'arête précédente de la face'\t| '>' : sélectionner l'arête suivante de la face @");
	ewgl.console.info_nl("@ '^' : sélectionner la face suivante\t\t\t| 'v' : sélectionner la face précédente\t\t @");
	ewgl.console.info_nl("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
}
function flipEdge(m,d)
{
	let d_bis = d.phi2;
	let e = d.phi1;		// Brin sur lequel d_bis va glisser
	let f = d_bis.phi1;	// Brin sur lequel d va glisser

	// On déconnecte l'arête de coupure de la face
	phi1Sew(d, d_bis.phi_1);
	phi1Sew(d_bis, d.phi_1);

	// On la reconnecte une arête plus loin dans le sens anti-horaire
	phi1Sew(d, e);
	phi1Sew(d_bis, f);

	// Met à jour la position des brins
	copyDartEmbedding(m.Vertex, d.phi1, d_bis);
	copyDartEmbedding(m.Vertex, d_bis.phi1, d);
}

function cutEdge(m,e,vpos)
{
	let e_bis = e.phi2;

	// Milieu de l'arête
	let middle = mix(vpos.getValue(e), vpos.getValue(e_bis), 0.5);

	// Nouveaux brins
	let t = m.newDart();
	let t_bis = m.newDart();

	// Déconnecte les deux brins de l'arête sélectionnée
	phi2Unsew(e);
	// Les reconnecte aux nouveaux brins
	phi2Sew(e, t);
	phi2Sew(e_bis, t_bis);

	// Les ajoute en phi1
	phi1Sew(e, t_bis);
	phi1Sew(e_bis, t);

	// Le nouveau sommet
	embedNewCell(m.Vertex, t_bis);
	vpos.setValue(t, middle);

	// Marque les brins comme arêtes d'origine si l'arête coupé en était une
	// (Permet de conserver un joli polyèdre lors d'opérations complexes) 
	if (initialEdgesMarker.isMarked(e)) {
		initialEdgesMarker.markCell(m.Edge, t);
		initialEdgesMarker.markCell(m.Edge, t_bis);
	}
}

function uncutEdge(m,e,vpos)
{
	// Remarque: inverse de la fonction cutEdge
	let t = e.phi2;
	let e_bis = t.phi_1;
	let t_bis = e.phi1;

	// Détache les deux brins créés dans cutEdge du phi1
	phi1Sew(e_bis, t);
	phi1Sew(e, t_bis);

	// Détache les deux sous-arêtes et rattache les arêtes qui resteront (phi2)
	phi2Unsew(e_bis);
	phi2Unsew(e);
	phi2Sew(e, e_bis);

	// Supprime les deux brins totalement déconnectées (qui ne sont plus que des points fixes)
	m.deleteDart(t);
	m.deleteDart(t_bis);
}
function cutFace(m,da,db)
{
	// Créé les deux brins attachés en phi1 et phi_1
	let ea = m.newCycle(2);
    let eb = ea.phi1;

	// Copie le sommet du suivant des deux brins sélectionnés pour l'attribuer aux nouveaux
    copyDartEmbedding(m.Vertex, da, eb);
    copyDartEmbedding(m.Vertex,db, ea);

	// Déconnecte les deux brins pour les attachés aux brins sélectionnés
    phi1Sew(da.phi_1, ea);
    phi1Sew(db.phi_1, eb);

	// Attache les deux brins créés en phi2 pour en faire une arête
    phi2Sew(ea, eb);
}

function mergeFaces(m,e)
{
	// Remarque: Inverse de la fonction cutFace
	let e_bis = e.phi2;

	// Détache l'arête de séparation
	phi1Sew(e, e_bis.phi_1);
	phi1Sew(e_bis, e.phi_1);
	// phi2Unsew(e);

	// Supprime l'arête de séparation
	m.deleteCycle(e);
}


function createCube(m2,vpos)
{
 // 6 carrés newCycle)
 let f1 = m2.newCycle(4);
 let f2 = m2.newCycle(4);
 let f3 = m2.newCycle(4);
 let f4 = m2.newCycle(4);
 let f5 = m2.newCycle(4);
 let f6 = m2.newCycle(4);

 phi2Sew(f1,f2);
 phi2Sew(f1.phi1, f3);
 phi2Sew(f1.phi1.phi1, f4);
 phi2Sew(f1.phi_1, f5);

 phi2Sew(f2.phi_1, f3.phi1);
 phi2Sew(f2.phi1, f5.phi_1);
 phi2Sew(f2.phi1.phi1, f6.phi1);

 phi2Sew(f3.phi_1, f4.phi1);
 phi2Sew(f3.phi1.phi1, f6);

 phi2Sew(f4.phi1.phi1, f6.phi_1);
 phi2Sew(f4.phi_1, f5.phi1);

 phi2Sew(f5.phi1.phi1, f6.phi1.phi1);


 embedNewCell(m2.Vertex,f1);
 vpos.setValue(f1,Vec3(-0.5,-0.5,-0.5));

 embedNewCell(m2.Vertex,decalZ(f1));
 vpos.setValue(decalZ(f1),Vec3(-0.5,-0.5,0.5));

 embedNewCell(m2.Vertex,f1.phi1);
 vpos.setValue(f1.phi1,Vec3(0.5,-0.5,-0.5));

 embedNewCell(m2.Vertex,decalZ(f1.phi1));
 vpos.setValue(decalZ(f1.phi1),Vec3(0.5,-0.5,0.5));

 embedNewCell(m2.Vertex,f1.phi1.phi1);
 vpos.setValue(f1.phi1.phi1,Vec3(0.5,0.5,-0.5));
 
 embedNewCell(m2.Vertex,decalZ(f1.phi1.phi1));
 vpos.setValue(decalZ(f1.phi1.phi1),Vec3(0.5,0.5,0.5));

 embedNewCell(m2.Vertex,f1.phi_1);
 vpos.setValue(f1.phi_1,Vec3(-0.5,0.5,-0.5));

 embedNewCell(m2.Vertex,decalZ(f1.phi_1));
 vpos.setValue(decalZ(f1.phi_1),Vec3(-0.5,0.5,0.5));
}

function createTetra(m2,vpos)
{
    // 4 triangles (newCycle)
    let f1 = m2.newCycle(3);
    let f2 = m2.newCycle(3);
    let f3 = m2.newCycle(3);
    let f4 = m2.newCycle(3);

    // 6 coutures (phi2Sew)
    phi2Sew(f1,f2);
    phi2Sew(f1.phi_1,f3);
    phi2Sew(f1.phi1,f4);

    phi2Sew(f2.phi_1,f4.phi1);
    phi2Sew(f2.phi1,f3.phi_1);
    phi2Sew(f3.phi1,f4.phi_1);

    // plonger les 4 sommets (embedNewCell, vpos.setValue)
    embedNewCell(m2.Vertex,f1);
    vpos.setValue(f1,Vec3(-1,-1,-1));

    embedNewCell(m2.Vertex,f1.phi1);
    vpos.setValue(f1.phi1,Vec3(0,1,-1));

    embedNewCell(m2.Vertex,f1.phi_1);
    vpos.setValue(f1.phi_1,Vec3(1,-1,-1));
    
    embedNewCell(m2.Vertex,f2.phi_1);
    vpos.setValue(f2.phi_1,Vec3(0,0,1));
}

function faceValence(v)
{
	// retourne le nombre de côtés de la face
	let valence = 0;
	let d = v;
	do
	{
		valence++;
		d = d.phi1;
	} while (d != v);
	return valence;
}

function vertexValence(v)
{
	let valence = 0;
	let v0 = v;
	do {
		v = v.phi2.phi1;
		valence ++;
	} while(v0 != v);
	return valence;
}

function computeFaceCenter(m,f,vpos)
{
	// Simple moyenne de la position de tous les sommets de la face
	let center = Vec3(0,0,0);
	let n = 0;

	let f0 = f;
	do {
		f = f.phi1;
		center.self_add(vpos.getValue(f));
		n++;
	} while(f0 != f);

	return center.div(Vec3(n,n,n));
}

function trianguleFace(m,f, vpos)
{
	// La technique de l'elastique, pour un triangle seulement
	let center = computeFaceCenter(m, f, vpos);

	// Coupe la face pour créer une arête sur l'arête
	cutFace(m, f, f.phi1, vpos);

	// Coupe la nouvelle arête afin de pouvoir avoir un point central
	let g = f.phi1.phi2;
	cutEdge(m, g, vpos);

	// Déplace se point central au milieu du triangle
	vpos.setValue(g.phi1, center);

	// Coupe la face restante pour avoir l'arête manquante entre le centre et le troisième sommet
	cutFace(m, g.phi_1, g.phi1, vpos);
}

function trianguleFaces(m, vpos)
{
	let f = m.beginFace();
	while(f != m.endFace())
	{
		let f0 = f;
		f = f.phi2;
		trianguleFace(m, f0, vpos);
	}
}

// la carte
let CM=null;
// l'attribut de position
let VPOS = null;


// code d'initialisation
function tp_init()
{
	// initialise la carte (global_cmap2), le plongement de sommet, et cree l'attribut vertex_position
	resetMap();
	CM = global_cmap2;
	VPOS = vertex_position;
	ewgl.console.toggle();
	let myobject = createTetra(CM,VPOS);
	print_commands();
}

// raccourci clavier
function tp_key_down(k)
{
	switch (k)
	{
	case 'v':
		print_commands();
		ewgl.console.info_nl("vertexValence = " + vertexValence(sdarts[0]));
		break
	case 'f':
		print_commands();
		ewgl.console.info_nl("faceValence = " + faceValence(sdarts[0]));
		break
	case 'c':
		cutEdge(CM,sdarts[0],VPOS);
		break;
	case 'd':
		cutFace(CM,sdarts[0],sdarts[1]);
		break;
	case 'e':
		flipEdge(CM,sdarts[0])
		break;
	case 't	':
		trianguleFaces(CM,VPOS);
			break;
	default:
		break;
	}
	update_map();
}

ewgl.loadRequiredFiles(["topo_lib.js","tp_topo_interface.js"], ewgl.launch_3d);



