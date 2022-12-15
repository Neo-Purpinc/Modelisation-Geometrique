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
	ewgl.console.info_nl("@ 'k' : Subdivision Catmull-Clark\t\t\t| 'l' : Subdivision Loop\t\t\t @");
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
	// if (initialEdgesMarker.isMarked(e)) {
	// 	initialEdgesMarker.markCell(m.Edge, t);
	// 	initialEdgesMarker.markCell(m.Edge, t_bis);
	// }
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
function createDodecahedron(m2, vpos)
{
    let d1 = m2.newCycle(5);
    let d2 = m2.newCycle(5);
    let d3 = m2.newCycle(5);
    let d4 = m2.newCycle(5);
    let d5 = m2.newCycle(5);
    let d6 = m2.newCycle(5);
    let e1 = m2.newCycle(5);
    let e2 = m2.newCycle(5);
    let e3 = m2.newCycle(5);
    let e4 = m2.newCycle(5);
    let e5 = m2.newCycle(5);
    let e6 = m2.newCycle(5);

    phi2Sew(d1, d6);
    phi2Sew(d1.phi1, d2);
    phi2Sew(d1.phi1.phi1, d3);
    phi2Sew(d1.phi_1.phi_1, d4);
    phi2Sew(d1.phi_1, d5);

    phi2Sew(e1, e6);
    phi2Sew(e1.phi1, e5);
    phi2Sew(e1.phi1.phi1, e4);
    phi2Sew(e1.phi_1.phi_1, e3);
    phi2Sew(e1.phi_1, e2);

    phi2Sew(d6.phi_1.phi_1, e6.phi_1.phi_1);

    phi2Sew(d2.phi_1, d3.phi1);
    phi2Sew(d3.phi_1, d4.phi1);
    phi2Sew(d4.phi_1, d5.phi1);
    phi2Sew(d5.phi_1, d6.phi1);
    phi2Sew(d6.phi_1, d2.phi1);

    phi2Sew(e2.phi1, e3.phi_1);
    phi2Sew(e3.phi1, e4.phi_1);
    phi2Sew(e4.phi1, e5.phi_1);
    phi2Sew(e5.phi1, e6.phi_1);
    phi2Sew(e6.phi1, e2.phi_1);

    phi2Sew(d2.phi1.phi1, e6.phi1.phi1);
    phi2Sew(d2.phi_1.phi_1, e2.phi_1.phi_1);
    phi2Sew(d3.phi1.phi1, e2.phi1.phi1);
    phi2Sew(d3.phi_1.phi_1, e3.phi_1.phi_1);
    phi2Sew(d4.phi1.phi1, e3.phi1.phi1);
    phi2Sew(d4.phi_1.phi_1, e4.phi_1.phi_1);
    phi2Sew(d5.phi1.phi1, e4.phi1.phi1);
    phi2Sew(d5.phi_1.phi_1, e5.phi_1.phi_1);
    phi2Sew(d6.phi1.phi1, e5.phi1.phi1);

    embedNewCell(m2.Vertex, d2);
    embedNewCell(m2.Vertex, d3);
    embedNewCell(m2.Vertex, d4);
    embedNewCell(m2.Vertex, d5);
    embedNewCell(m2.Vertex, d6);
    embedNewCell(m2.Vertex, d2.phi1.phi1);
    embedNewCell(m2.Vertex, d3.phi1.phi1);
    embedNewCell(m2.Vertex, d4.phi1.phi1);
    embedNewCell(m2.Vertex, d5.phi1.phi1);
    embedNewCell(m2.Vertex, d6.phi1.phi1);
    embedNewCell(m2.Vertex, e2);
    embedNewCell(m2.Vertex, e3);
    embedNewCell(m2.Vertex, e4);
    embedNewCell(m2.Vertex, e5);
    embedNewCell(m2.Vertex, e6);
    embedNewCell(m2.Vertex, e2.phi1.phi1);
    embedNewCell(m2.Vertex, e3.phi1.phi1);
    embedNewCell(m2.Vertex, e4.phi1.phi1);
    embedNewCell(m2.Vertex, e5.phi1.phi1);
    embedNewCell(m2.Vertex, e6.phi1.phi1);

    const Q = (1 + Math.sqrt(5)) / 2;
    const W = 1 / Q;
    vpos.setValue(d2, Vec3(-1, +1, +1));
    vpos.setValue(d3, Vec3(-0, +Q, +W));
    vpos.setValue(d4, Vec3(-0, +Q, -W));
    vpos.setValue(d5, Vec3(-1, +1, -1));
    vpos.setValue(d6, Vec3(-Q, +W, -0));
    vpos.setValue(d2.phi1.phi1, Vec3(-Q, -W, -0));
    vpos.setValue(d3.phi1.phi1, Vec3(-W, -0, +Q));
    vpos.setValue(d4.phi1.phi1, Vec3(+1, +1, +1));
    vpos.setValue(d5.phi1.phi1, Vec3(+1, +1, -1));
    vpos.setValue(d6.phi1.phi1, Vec3(-W, -0, -Q));
    vpos.setValue(e2, Vec3(-0, -Q, +W));
    vpos.setValue(e3, Vec3(+1, -1, +1));
    vpos.setValue(e4, Vec3(+Q, -W, -0));
    vpos.setValue(e5, Vec3(+1, -1, -1));
    vpos.setValue(e6, Vec3(-0, -Q, -W));
    vpos.setValue(e2.phi1.phi1, Vec3(+W, -0, +Q));
    vpos.setValue(e3.phi1.phi1, Vec3(+Q, +W, -0));
    vpos.setValue(e4.phi1.phi1, Vec3(+W, -0, -Q));
    vpos.setValue(e5.phi1.phi1, Vec3(-1, -1, -1));
    vpos.setValue(e6.phi1.phi1, Vec3(-1, -1, +1));
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
function trianguleFace(m,f,vpos)
{
	let debut = f.phi_1;
	let centre = computeFaceCenter(m, f, vpos);
	cutFace(m, f, f.phi1, vpos);
	let g = f.phi1.phi2;
	cutEdge(m, g, vpos);
	vpos.setValue(g.phi1, centre);
	let f0 = f.phi1.phi2.phi1.phi1;
	do {
		cutFace(m, f0, f0.phi_1.phi_1);
		f0 = f0.phi1;
	} while (f0 != debut.phi1);
}
function trianguleFaces(m, vpos)
{
	let marker = DartMarker();
	// On marque toutes les faces originales
	m.foreachCell(m.Face, f => { marker.markCell(m.Face, f); });
	// Pour chaque face marquée
	m.foreachCell(m.Face, f => {
		if (marker.isMarked(f)) {
			// on la triangule et on la démarque
			trianguleFace(m, f, vpos);
			marker.unmarkCell(m.Face, f);
		}
	});
}
function computeEdgePoints(m, vpos)
{
    let marker = DartMarker();
	// on parcourt tous les brins de la carte
    m.foreachCell(m.Edge, e => {
		// si le brin n'est pas marqué
		if (!marker.isMarked(e)) {
			// on le coupe
			cutEdge(m, e, vpos);
			// on marque les deux brins créés afin de ne pas les retraiter après
			marker.markCell(m.Edge, e);
			marker.markCell(m.Edge, e.phi1);
		}
	});
}
function catmullClark_one_iter(m,vpos){
	let markerOriginal = DartMarker();
	// On marque tous les vertex originaux
	m.foreachCell(m.Vertex, v => {markerOriginal.markCell(m.Vertex, v);});
	// On calcule les nouveaux points d'arêtes
	computeEdgePoints(m,vpos);
	// On calcule les nouveaux points de faces
	let facesOriginal = [];
	// On stocke les faces originales dans un tableau
	m.foreachCell(m.Face, f => {facesOriginal.push(f);});
	// On triangule toutes les faces en reliant le point de face et les nouveaux points d'arêtes
	facesOriginal.forEach(f => {
		trianguleFace(m,f,vpos);
		let v0 = f.phi1.phi2; // f.phi1.phi2 = point de face
		do {
			if (markerOriginal.isMarked(v0.phi1)) {
				// Obligé de passer par une variable intermédiaire car il faut modifier v0 avant de le perdre avec mergeFaces
				let edgeToDelete = v0;
				v0 = v0.phi_1.phi2;
				mergeFaces(m, edgeToDelete);
			}
			else v0 = v0.phi_1.phi2;
		} while (v0 != f.phi1.phi2);
	});
}
function loopSubdivision_one_iter(m,vpos){
	let markerOriginal = DartMarker();
	// On marque tous les vertex originaux
	m.foreachCell(m.Vertex, v => {markerOriginal.markCell(m.Vertex, v);});
	// On calcule les nouveaux points d'arêtes
	computeEdgePoints(m,vpos);
	// On calcule les nouveaux points de faces en créant de nouveaux sommets au centre de chaque face
	// et en les reliant aux points d'arêtes en utilisant le marqueur
	let markerCut = DartMarker();
	m.foreachCell(m.Face, f =>
	{
		// Si la face a déjà été coupée, on ne fait rien
		if (markerCut.isMarked(f)) {return;}
		// Si le sommet est original, on passe à celui d'après
		if (markerOriginal.isMarked(f)) {f = f.phi1};
		// On coupe la face en 4 et on marque chaque face coupée
		cutFace(m, f.phi1.phi1, f.phi1.phi1.phi1.phi1);
		markerCut.markCell(m.Face, f.phi1.phi1.phi2);
		cutFace(m, f.phi1.phi1.phi1, f);
		markerCut.markCell(m.Face, f.phi_1.phi2);
		cutFace(m, f, f.phi1.phi1);
		markerCut.markCell(m.Face, f);
		// Marque la "face centrale"
		markerCut.markCell(m.Face, f.phi_1.phi2);
	});
}
function catmullClark(m,vpos,iter){
	for(let i = 0; i < iter; i++){
		catmullClark_one_iter(m,vpos);
	}
}
function loopSubdivision(m,vpos,iter){
	m.foreachCell(m.Face, f => {
		if(faceValence(f) != 3){
			trianguleFaces(m,vpos);
			print_commands();
			ewgl.console.info_nl("Les faces n'étaient pas triangulées, elles le sont à présent.")
			return;
		}
	});
	for(let i = 0; i < iter; i++){
		loopSubdivision_one_iter(m,vpos);
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
	// let myobject2 = createCube(CM,VPOS);
	// let myobject3 = createDodecahedron(CM,VPOS);
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
		break;
	case 'f':
		print_commands();
		ewgl.console.info_nl("faceValence = " + faceValence(sdarts[0]));
		break;
	case 'c':
		if(sdarts.length >= 1)
			cutEdge(CM,sdarts[0],VPOS);
		else
			ewgl.console.info_nl("Veuillez selectionner au moins une arête");
		break;
	case 'd':
		if(sdarts.length >= 2)
			cutFace(CM,sdarts[0],sdarts[1]);
		else
			ewgl.console.info_nl("Veuillez selectionner aux moins deux arêtes");
		break;
	case 'e':
		if(sdarts.length >= 1)
			flipEdge(CM,sdarts[0])
		else
			ewgl.console.info_nl("Veuillez selectionner au moins une arête");
		break;
	case 't':
		trianguleFaces(CM,VPOS);
		break;
	case 'k':
		catmullClark(CM,VPOS,1);
		break;
	case 'l':
		loopSubdivision(CM,VPOS,1);
		break;
	default:
		break;
	}
	update_map();
}

ewgl.loadRequiredFiles(["topo_lib.js","tp_topo_interface.js"], ewgl.launch_3d);



