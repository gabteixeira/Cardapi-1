import { ForceTouchGestureHandler } from 'react-native-gesture-handler';
import {firebase} from '../utils/firebase';

export const loginUser = (user) => {
    return {
        type: "LOGIN_USER",
        user: user
    }
}

export const guestUser = () => {
    return {
        type: "GUEST_USER",
    }
}

export const updateFavorite = (favorito) =>{
  return{
    type: "UPDATE_FAVORITOS",
    payload: favorito
  }
}

export const deleteFavorite = (favorito) =>{
  return{
    type: "DELETE_FAVORITO",
    payload: favorito
  }
}

export const setComanda = (comanda=1, userID=1) => {
  return (dispatch, getState) => {
    if(comanda) {
      firebase.database().ref('users/'+userID+'/profile').update({
        comanda: comanda
      });
      firebase.database().ref('comandas/'+comanda+'/consumo/'+userID).update({
        nome: getState().user.name,
        foto: getState().user.photoURL
      });
    } else {
      firebase.database().ref('users/'+userID+'/profile/comanda').remove();
    }
    dispatch({type: 'SET_COMANDA', payload: comanda});
  }
}

export const removerParticipantes = (consumo) => {
  return () => {
    consumo.participantes.forEach((participante) => {
      firebase.database().ref('users/'+participante.id+'/profile/comanda').remove();
    });
  }
}

export const controleComanda = () => {
  return (dispatch, getState) => {
    const id = getState().user.id;
    firebase.database().ref('users/'+ id + '/profile/comanda').on('value', snap => {
      dispatch({type: 'SET_COMANDA', payload: snap.val()});
    });
  }
}