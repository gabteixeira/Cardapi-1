import {firebase} from '../utils/firebase';

export const addItem = (item) => {
  return {
    type: "ADD_ITEM",
    item: item
  }
}

export const chamarGarcom = () => {
  return (dispatch, getState) => {
    const { comanda } = getState();
    dispatch(chamandoGarcom(!comanda.chamando));
    firebase.database().ref('comandas/' + comanda.comanda_id).update({
      chamando: !comanda.chamando
    });
  }
}

export const chamandoGarcom = (status) => {
  return {
    type: "CHAMANDO_GARCOM",
    payload: status 
  }
}

export const abrirComanda = (codigo, userId=10) => {
  console.log("cod:");
  console.log(codigo);
  return (dispatch) => {
    var comanda;
    firebase.database().ref('comandas/'+ codigo).once('value', snap => {
      comanda = snap.val();
    }).then(() => {
      if(comanda) {
        if(comanda.owner) {
          dispatch({type: "COMANDA_OCUPADA", payload: [comanda, codigo, userId]});
        } else {
          console.log("chegou4");
          dispatch({type: "COMANDA_ATRIBUIDA", payload: [comanda, codigo, userId]});
          firebase.database().ref('comandas/' + codigo).update({
            owner: userId
          });
        }
      } else {
        console.log("chegou5");
        dispatch({type: "COMANDA_INEXISTENTE"});
      }
    })
  }
}