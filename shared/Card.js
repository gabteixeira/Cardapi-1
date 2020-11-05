import React, {useState} from 'react';
import {StyleSheet, View, Text,Image, TouchableOpacity} from 'react-native';

// Estilo Global
import {globalStyles} from '../styles/global';

import { MaterialIcons } from '@expo/vector-icons'; 

export default function Card(){
    const [isFavorite, setFavorite] = useState('false');
    const Favorite = () =>{
        setFavorite(!isFavorite);
    }

    return(
        <View style={styles.cardContainer}>
            <View>
                <Image source={require('../assets/images/home_outback_fachada.png')} style={{position:'relative', borderTopLeftRadius:20, borderTopRightRadius:20, width:"100%", height:133}}/>
                <View style={{backgroundColor:"#F2F2F2", position:'absolute', left:"90%", height:"25%", width:"10%", borderBottomLeftRadius:20, borderBottomRightRadius:20, alignItems:'center',justifyContent:'center'}}>
                    <TouchableOpacity onPress={Favorite}>
                        {isFavorite ? <MaterialIcons name="favorite-border" size={25} color="#740300"/> : <MaterialIcons name="favorite" size={25} color="#740300"/>  } 
                    </TouchableOpacity>
                </View>
             </View>
            <Text style={{...globalStyles.sub1, marginLeft:"3.5%",marginTop:'2.8%'}}>Outback SteakHouse</Text>
            <View style={styles.rowContainerTipo}>
                <Text style={{...globalStyles.legenda1,color:"#404040",paddingRight: "1.5%"}}>SteakHouse • 3,5km •</Text>
                <Image source={require('../assets/icons/coupon.png')} style={{marginRight:"0.6%"}} />
                <Text style={{...globalStyles.legenda1,color:"#404040"}}>Consumo Médio: R$ 80,00</Text>
            </View>
            <View style={styles.rowContainerConquistas}>
                <Text style={{...globalStyles.body3, marginLeft:"3.5%"}}>Conquistas Disponíveis:10/10</Text>
                <View style={{marginLeft:"18%",flexDirection:'row'}}>
                    <MaterialIcons name="accessible" size={15} color="black" style={{paddingRight:"1%"}} />
                    <MaterialIcons name="directions-car" size={15} color="black" style={{paddingRight:"1%"}}/>
                    <MaterialIcons name="wifi" size={15} color="black" style={{paddingRight:"1%"}}/>
                    <MaterialIcons name="music-note" size={15} color="black" />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    rowContainerTipo:{
        marginTop:"1.4%",
        flexDirection:'row',
        marginLeft:"3.5%",
    },
    rowContainerConquistas:{
        marginTop:"5%",
        paddingBottom:'2%',
        flexDirection:'row',
    },
    cardContainer:{
        borderRadius:20,
        maxHeight:'35%',
        backgroundColor:"#F2F2F2",
        elevation:3,
        width:'93.6%',
        marginBottom:"5%",
    }
})