import React, {useEffect, useState} from 'react';
import {View, Text,StyleSheet,ScrollView,Image,Alert,Platform} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {firebase} from '../utils/firebase';
import * as ImagePicker from 'expo-image-picker';
import {useDispatch, useSelector} from 'react-redux';

import {loginUser} from '../actions/userActions';


// Estilo Global
import {globalStyles} from '../styles/global';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function RestaurantProfile({navigation}){
    const [user,setUser] = useState(firebase.auth().currentUser)
    const [endereco, setEndereco] = useState(null)
    const [image,setImage] = useState(null)
    const userData = useSelector((state)=>state.user)
    const dispatch = useDispatch()

     useEffect(() => {
         if(user){
             firebase.storage().ref(user.photoURL).getDownloadURL().then((url) =>{
                 setImage(url);
             })
         }
        
     }, []);

     firebase.auth().onAuthStateChanged(function(userListener) {
        if (userListener) {
            setUser(firebase.auth().currentUser);
            if(user != null){
                console.log(user)
                const realtime = []
                const refUser = firebase.database().ref('restaurant/'+user.uid);
                const listener = refUser.once('value', snapshot =>{
                    snapshot.forEach(childSnapshot => {
                        const key = childSnapshot.key;
                        const data = childSnapshot.val();
                        realtime.push({id: key, ...data });
                    });
       
                    const object = {
                        'id': user.uid,
                        'email':user.email,
                        'photoURL':user.photoURL,
                        'name':realtime[0].name,
                        'cnpj':realtime[0].cnpj,
                        'categoria': realtime[0].type,
                        'phone':realtime[0].phone,
                        'endereco': realtime[0].endereco,
                        'acessible': realtime[0].acessible,
                        'estacionamento': realtime[0].estacionamento,
                        'music': realtime[0].music,
                        'wifi': realtime[0].wifi,
                        'bio': realtime[0].bio,
                    }
                    // Adiciona os dados do usuário logado para o estado do Redux
                    dispatch(loginUser(object))
                })
            }
        } else {
          // No user is signed in.
        }
      });

    const pickImage = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
            if (status !== 'granted') {
              alert('Nos perdoe, mas só poderemos fazer o upload da foto com a sua permissão');
            }
        }
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        console.log(result);
    
        if (!result.cancelled) {
          setImage(result.uri);

            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function() {
                resolve(xhr.response);
                };
                xhr.onerror = function(e) {
                console.log(e);
                reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', result.uri, true);
                xhr.send(null);
            });
            
            user.updateProfile({
                photoURL:user.uid
            })
            
            const upload = await firebase.storage().ref(user.uid).put(blob)

            blob.close()
    }
      };

    const toData = () => {
        navigation.navigate('Minhas Infos')
    }

    const toAbout = () => {
        navigation.navigate('Sobre nós')
    }

    const toMenu = () =>{
        navigation.navigate('Meu Cardápio')
    }

    useEffect(() =>{
        if(user == null){
            return navigation.replace('Login')
        }
    })

    if(user){
    return(
        <ScrollView>
        <View style={{flex:1}}>
            <View style={{marginLeft:"5%", marginTop:"4.8%"}}>
                <View style={{flexDirection:'row' }}>
                    <TouchableOpacity onPress={pickImage}>
                       {image && <Image source={{ uri: image }} style={{borderWidth:1, width:77,height:77 ,borderColor:'black',borderRadius:77/2}}/>}
                    </TouchableOpacity>
                    <View style={{flex:1}}>
                        <View style={{flex:1,flexDirection:'row',marginBottom:"4.375%", justifyContent:'space-between'}}>
                            <Text style={{...globalStyles.sub1, marginLeft:"4%"}}>{userData['name']}</Text>
                                <Text style={{...globalStyles.body3, marginRight:"4%"}}>Ver mais</Text>
                            </View>
                        <View style={{marginLeft:"4%"}}>
                            <Text style={{...globalStyles.body3, color: "#009922"}}>Aberto</Text>
                            <Text style={globalStyles.body3}>Desafios Propostos: 3</Text>
                        </View>
                    </View>
                </View>
                <View>

                    <View style={{flexDirection:'row', marginTop:"4.3%"}}>
                        <MaterialIcons style={{marginRight:"1%"}} name="room" size={16} color="black" />
                        <Text style={globalStyles.body3}>{endereco!=null ? userData['endereco'] :'Rua Fernando Diniz, 4222, Boqueirão - Santos/SP'}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginTop:"1%"}}>
                        <MaterialCommunityIcons style={{marginRight:"1%"}} name="phone" size={16} color="black" />
                        <Text style={globalStyles.body3}>{userData['phone']}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.menuContainer}>
                <View style={{height:59,justifyContent:"center",alignItems:"center"}}>
                    <TouchableOpacity onPress={toData}>
                        <Text style={globalStyles.body1}>Meus Dados</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.OptionMenu}>
                    <TouchableOpacity onPress={toMenu}>
                    <Text style={globalStyles.body1}>Meu Cardápio</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.OptionMenu}>
                        <Text style={globalStyles.body1}>Conquistas</Text>
                </View>
                <View style={styles.OptionMenu}>
                    <Text style={globalStyles.body1}>Formas de Pagamento</Text>
                </View>
                <TouchableOpacity>
                <View style={styles.OptionMenu}>
                    <Text style={globalStyles.body1}>Ajuda</Text>
                </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={toAbout}>
                    <View style={styles.OptionMenu}>
                        <Text style={globalStyles.body1}>Quem Somos</Text>
                    </View>
                </TouchableOpacity>
                
                <View style={{alignItems:"center", marginTop:"9%"}}>
                <TouchableOpacity onPress={() => {firebase.auth().signOut().then(() =>{
                    navigation.replace('Login')
                })}}>
                    <Text style={{...globalStyles.body1, color:"#8C0A07"}}>Sair</Text>
                </TouchableOpacity>
                </View>
            </View>
        </View>
        </ScrollView>
   
    );} else{
        return(
            <View></View>
        )
    }
}

const styles = StyleSheet.create({
    menuContainer:{
        marginTop:"2.6%",
        borderTopLeftRadius:50,
        borderTopRightRadius:50,
        width:"100%",
        flex:1,
        marginBottom:90,
        borderColor:"#E5E5E5",
        borderBottomWidth:0,
        borderWidth:1
    },
    OptionMenu:{
        borderTopColor:"#E5E5E5",
        borderTopWidth:1,
        height:59,
        alignItems:'center',
        justifyContent:'center',
        
    }
})