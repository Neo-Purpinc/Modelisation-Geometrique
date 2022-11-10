"use strict"

function mix(a,b,k)
{
	return a.scalarmult(1-k).add(b.scalarmult(k));
}


function flipEdge(m,e)
{
	// utiliser phi1Sew et copyDartEmbedding
}

function cutEdge(m,e,vpos)
{
	let e2 = e.phi2;
	//enleve phi2
	phi2Unsew(e);
	// nouveaux brins
	let f = m.newDart();
	let f2 = m.newDart();

	//insert derriere les brins de l'arete
	phi1Sew(e,f);
	phi1Sew(e2,f2);

	// couture phi2
	phi2Sew(e,f2);
	phi2Sew(e2,f);

	//plongement nouveau sommet
	let P1 = vpos.getValue(e);
	let P2 = vpos.getValue(e2);
	let P3 = mix(P1,P2,0.5);
	embedNewCell(m.Vertex,f);
	vpos.setValue(f,P3);
}

function cutFace(m,da,db)
{
	// cree une "arete" isolee
	let e = m.newCycle(2);
	let e2 = e.phi1;

	// insert l'arete dans le sommet da
	phi1Sew(da.phi_1, e2);

	// insert l'arete dans le sommet db
	phi1Sew(db.phi_1, e);

	// phi2
	phi2Sew(e,e2);

	// plonge
	copyDartEmbedding(m.Vertex,da,e);
	copyDartEmbedding(m.Vertex,db,e2);
}

function mergeFaces(m,e)
{
	// phi1sew et deleteCycle
}

function decalZ(f)
{
 return f.phi2.phi1.phi1.phi2.phi1
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

function  faceValence(v)
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


function  vertexValence(v)
{

}

function computeFaceCenter(m,f,vpos)
{
}

function trianguleFace(m,f, vpos)
{
}

function trianguleFaces(m, vpos)
{
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
	
	let myobject = createTetra(CM,VPOS);
	// let myobject = createCube(CM,VPOS);
}

// raccourci clavier
function tp_key_down(k)
{
	switch (k)
	{
	case 'v':
		console.log(vertexValence(sdarts[0]));
		break
	case 'f':
		console.log(faceValence(sdarts[0]));
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



