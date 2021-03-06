import React, {useEffect,useState} from 'react';
import {View, Text,StyleSheet,ScrollView,Image, KeyboardAvoidingView,TextInput} from 'react-native';
import InputNormal from '../shared/InputNormal';
import {TouchableOpacity } from 'react-native-gesture-handler';
import { globalStyles } from '../styles/global';
import { MaterialIcons } from '@expo/vector-icons';
import {Formik} from 'formik';
import {useDispatch} from 'react-redux'
import {firebase} from '../utils/firebase'
import * as yup from 'yup';

import {deleteBebidas,deletePratos,deleteSobremesas} from '../actions/userActions';

import * as ImagePicker from 'expo-image-picker';
import Loading from '../shared/Loading'
import PopUpMsg from '../shared/PopUpMsg';


export default function EditItem({navigation, route}){
    const [isLoading,setLoading] = useState(false)
    const [modal,setModal] = useState(false)
    const dispatch = useDispatch()
    const [image, setImage] = useState('default_profile.png')
    const [itens,setItens] = useState(null)

    
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
    
        if (!result.cancelled) {
          setImage(result.uri);
        }
      };

    const UserSchema  = yup.object({
        name: yup.string().required('Digite um nome para o seu item').min(2,'Digite um nome maior'),
        desc: yup.string().required('Digite uma descrição para o seu item').min(5, "o item deve ter uma descrição de no mínimo 5 caracteres."),   
        price: yup.number().required('O item deve possuir um preço')
    })

    useEffect(() => {
        let isMounted = true
        firebase.database().ref("restaurant/"+route.params.restaurante+"/cardapio/"+route.params.tipo+"/"+route.params.id).once('value', snapshot =>{
            firebase.storage().ref(route.params.restaurante+"/"+route.params.id).getDownloadURL().then((url) =>{
                if(isMounted){
                    setItens(snapshot.val())
                    setImage(url)
                }
            })
 
        })
        return () => {isMounted = false}
    }, [itens,image]);

    const excluirItem = () =>{
        firebase.database().ref("restaurant/"+route.params.restaurante+"/cardapio/"+route.params.tipo+"/"+route.params.id).remove().then(() =>{
            navigation.goBack()
            if(route.params.tipo == 'bebidas')
                dispatch(deleteBebidas(route.params.id))
            else if(route.params.tipo == 'pratos')
                dispatch(deletePratos(route.params.id))
            else if(route.params.tipo == 'sobremesas')
                dispatch(deleteSobremesas(route.params.id))
        })
    }
    
    if(itens){
    return(
        <ScrollView>
            <View style={{backgroundColor:'white', marginBottom:40}}>
                <View style={styles.containerForms}>
                    <Formik
                        initialValues={{name:itens.nome,desc:itens.descricao, price:itens.preco, img:''}}
                        validationSchema={UserSchema}
                        onSubmit={async (values) =>{
                            console.log("oi")
                            setLoading(true)
                            const object = {
                                "nome":values.name,
                                "descricao":values.desc,
                                "preco":values.price,
                                "img":image =="default_profile.png" ? image:route.params.restaurante +"/"+route.params.id
                            }  
                            const myRef = firebase.database().ref("restaurant/"+route.params.restaurante+"/cardapio/"+route.params.tipo +"/"+route.params.id).update(object).then(async () => {
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
                                    xhr.open('GET', image, true);
                                    xhr.send(null);
                                });
                        
                                const upload = await firebase.storage().ref(object['img']).put(blob)
                        
                                blob.close()
                            }).then(() =>{
                                setModal(true)
                            })
                        }}
                    >
                    {(props) =>{
                        if(!isLoading){
                            return(                           
                                <KeyboardAvoidingView behavior='height'>
                                    <InputNormal placeholder="(Insira aqui o nome do seu prato)" label="Nome do Prato" onChangeText={props.handleChange('name')} value={props.values.name} />

                                    <View style={{...styles.inputLabel}}>
                                        <Text style={{...globalStyles.legenda2, ...globalStyles.preto2, marginTop:"4%"}}>Descrição</Text>
                                        <View style={styles.passwordEye}>
                                            <TextInput 
                                            multiline={true}
                                            style={{marginBottom:"3%", ...globalStyles.body1, flex:1}}
                                            placeholder="(Digite a descrição do prato)"
                                            onChangeText= {props.handleChange('desc')} 
                                            value={props.values.desc}
                                            />
                                        </View>
                                    </View>

                                    <InputNormal placeholder="(Digite o preço)" label="Preço" keyboardType='numeric' onChangeText={props.handleChange('price')} value={props.values.price} />

                                    <View style={{marginTop:"9.9%", alignItems:'center'}}>
                                    {image && <Image source={{ uri: image }} style={{borderWidth:1,width:100,height:100 ,marginBottom:10,borderColor:'black'}}/>}
                                    <TouchableOpacity onPress={pickImage} style={{flexDirection:'row', borderWidth:1, borderColor:"#A60400", borderRadius:5, justifyContent:'center', alignItems:'center', alignContent:'center',height:40,minWidth:"89%"}}>
                                        <MaterialIcons name="camera-alt" size={20} color="#A60400" />
                                        <Text style={{color:'#A60400', marginLeft:"3%", ...globalStyles.body1}}>Trocar Imagem</Text>
                                    </TouchableOpacity>
                                    </View>

                                    <View style={{alignItems:"center", marginTop:"15%", flexDirection:'row', justifyContent:'center'}}>
                                    <TouchableOpacity style={{flexDirection:'row', borderWidth:1, borderColor:"#A60400", borderRadius:5, marginRight:10, justifyContent:'center', alignItems:'center', alignContent:'center',height:40,minWidth:"33.33%"}} onPress={excluirItem}>
                                        <Text style={{color:"#A60400",...globalStyles.body1} }>Excluir</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={globalStyles.mediumButtonStyle} onPress={props.handleSubmit}>
                                        <Text style={{color:"#FAFAFA",...globalStyles.body1}}>Salvar</Text>
                                    </TouchableOpacity>
                                    </View>

                                </KeyboardAvoidingView>
                            )
                        } else{
                            return(
                                <View style={{width:360, height:640}}>
                                     <PopUpMsg message="O seu item foi atualizado com sucesso!" onClosed={()=>navigation.goBack()} isOk={true} isOpen={modal}/>    
                                     <Loading />
                                </View>
                               
                            )
                        }
                        }
                    }
                    </Formik>
                </View>
            </View>
        </ScrollView>
    );}
    else{
        return(
            <Loading />
        )
    }
}

const styles = StyleSheet.create({
    containerForms:{
        marginTop:"6%", 
        backgroundColor:"white",
        borderRadius:16,
        alignItems:'center',
        marginBottom:"20%",
        width:"100%",
        height:640
    },
    inputLabel:{
        paddingLeft:"5%",
        marginTop:"3.125%",
        borderRadius:8,
        minWidth:"88%",
        height:150,
        backgroundColor:"#E5E5E5",
    },
    passwordEye:{
        flexDirection:'row',
        justifyContent:'space-between'
    },

});