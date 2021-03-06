import _ from 'lodash';
import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Platform,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

GLOBAL.FormData = GLOBAL.originalFormData || GLOBAL.FormData

import CheckBox from '@react-native-community/checkbox';
import { Picker } from '@react-native-community/picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SignIn } from '../actions';

import api from '../../services/api';

import ImagePicker from 'react-native-image-picker';

import { useDropDown } from '../../contexts';

const InsertAD = props => {
  const { navigation, route, logged } = props;

  if (!logged) {
    navigation.navigate('Login');
    return null;
  }

  const { ref } = useDropDown();

  const selected = route.params ? route.params.selected : undefined;
  const subcategory =
    selected && selected.subcategory ? selected.subcategory : undefined;

  const [destroy, setDestroy] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cep, setCep] = useState('');
  const [price, setPrice] = useState('');

  const [checkBox, setCheckBox] = useState(false);
  const [details, setDetails] = useState({});

  const [images, setImages] = useState([]);

  const category = {};

  if (selected) {
    category['main'] = selected.category;

    if (selected.subcategory && selected.subcategory.name) {
      category['specific'] = selected.subcategory.name;
    }
  }

  const auxCategoryName = selected ? !_.isEmpty(subcategory) ? subcategory.name : selected.category : 'Selecione uma categoria';

  const handleOpenCamera = () => {
    const options = {
      noData: true,
    };

    ImagePicker.launchCamera(options, response => {
      if (response.uri && images.length < 6)
        setImages([...images, response]);
    })
  }

  const handleChoosePhoto = () => {
    const options = {
      noData: true,
    };

    ImagePicker.launchImageLibrary(options, response => {
      if (response.uri && images.length < 6)
        setImages([...images, response]);
    });
  }

  async function handleSubmit() {

    if (title && description && !_.isEmpty(category) && cep) {
      const data = new FormData();

      data.append('title', title)
      data.append('description', description);
      data.append('_category', JSON.stringify(category))
      data.append('cep', cep)
      data.append('price', price)
      data.append('hideNumber', checkBox ? 'true' : 'false')
      data.append('details', JSON.stringify(details))

      images.forEach((photo, index) => {
        data.append('images', {
          uri: photo.uri,
          type: 'image/jpeg', // or photo.type
          name: photo.fileName
        });
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data; charset=utf-8;'
        }
      };

      const res = await api.post('/anunciar', data, config)
        .then(value => {
          
          setDestroy(true);
          setImages([])
          route.params = undefined;

          ref.current.alertWithType("success", "Sucesso!", "Seu produto foi adicionado com exito :)");
          // navigation.navigate('Anúncios')
          navigation.navigate('Home')
        })
        .catch(err => {
          if (err) {
            if (err.response) {

              ref.current.alertWithType("error", "Erro!", err.response.data);

              console.log(err.response.data)
            } else {
              ref.current.alertWithType("error", "Erro!", err.message);
              console.log(err)
            }
          }
        })
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      setDetails({});
    }, [])
  )

  return (
    <SafeAreaView key={destroy}>
      <ScrollView>
        <View style={{ backgroundColor: "#dfdfdf" }} >
          <View
            style={{
              height: 250, margin: 20,
              justifyContent: "center", alignItems: "center",
              borderColor: "#6D0AD6", borderStyle: "dashed", borderWidth: 1, borderRadius: 8
            }}
          >
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center" }} >

              <View style={{ flexDirection: "row" }} >
                <TouchableOpacity
                  onPress={handleOpenCamera}
                  style={{ flexDirection: "column", alignItems: "center", marginHorizontal: 30 }} >
                  <MaterialIcons name="add-a-photo" size={45} color="#6D0AD6" />
                  <Text style={{ color: "#6D0AD6", fontWeight: "700" }} >Usar a Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleChoosePhoto}
                  style={{ flexDirection: "column", alignItems: "center", marginHorizontal: 30 }}
                >
                  <MaterialIcons name="collections" size={45} color="#6D0AD6" />
                  <Text style={{ color: "#6D0AD6", fontWeight: "700" }} >Escolher da galeria</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", position: "absolute", bottom: -70, justifyContent: "center", alignItems: "center" }} >
                <Text>{images.length ? images.length : 0} de 6 adicionados</Text>
              </View>

            </View>

          </View>

        </View>

        {images.length ?
          <View style={{ marginVertical: 10, justifyContent: "center", flexDirection: "row" }}>
            {images.map((image, index) =>

              <Image key={index}
                source={{ uri: image.uri }}
                style={{ width: 50, height: 50, marginHorizontal: 2.5, borderRadius: 5 }}
              />
            )}
          </View> : undefined
        }
        <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <View>
            <Text style={{
              marginVertical: 10,
              fontSize: 16
            }} >Titulo do anúncio*</Text>

            <TextInput

              onChangeText={setTitle}
              style={{
                paddingHorizontal: 15,
                borderRadius: 8,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: "#0000008a"
              }}
              placeholder="Ex: Samsung S9 novo na caixa"
            />
          </View>

          <View style={{}} >
            <Text style={{
              marginVertical: 10,
              fontSize: 16
            }} >Descrição*</Text>

            <TextInput

              onChangeText={setDescription}
              style={{
                padding: 15,
                borderRadius: 8,
                borderColor: "#0000008a",
                fontSize: 15,
                borderWidth: StyleSheet.hairlineWidth,
              }}
              textAlignVertical="top"
              multiline
              numberOfLines={6}
              placeholder="Ex: Smartphone Samsung Galaxy S9 com 128gb de memória, com caixa, todos os cabos e sem marca de uso ."
            />
          </View>

          <View style={{}}>
            <Text style={{
              marginVertical: 10,
              fontSize: 16
            }} >Categoria*</Text>

            <TouchableOpacity onPress={() => { navigation.navigate('Categorias'); setDetails({}) }}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: "#0000008a",
                padding: 7.5,
                paddingLeft: 15,
                borderRadius: 8
              }}
            >
              <Text style={{ color: "#aaa" }}>{auxCategoryName}</Text>
              <MaterialIcons name="keyboard-arrow-right" size={30} color="#777" />

            </TouchableOpacity>

          </View>

          {
            subcategory ?

              <View style={{ flexDirection: "column" }} >
                {Object.entries(subcategory).map((item, index) =>

                  item[0] !== 'name' ?
                    (<View key={index} style={{ flexDirection: "column" }} >
                      <Text style={{
                        textTransform: 'capitalize',
                        marginVertical: 10,
                        fontSize: 16,

                      }}>{item[0].replace(/[^a-z0-9-]/g, ' ')}</Text>

                      {typeof item[1] === "object" ?

                        item[0] !== 'estado_financeiro' && item[0] !== 'opcionais' && item[0] !== 'options' ?
                          <View
                            style={{
                              borderColor: "#666",
                              borderWidth: StyleSheet.hairlineWidth,
                              borderRadius: 5,
                              paddingLeft: 10,
                            }}
                          >
                            <Picker
                              selectedValue={!_.isEmpty(details[item[0]]) ? details[item[0]] : ''}
                              style={{ height: 50, width: '100%' }}
                              onValueChange={
                                value => {
                                  if (value === undefined)
                                    return null;
                                  setDetails({
                                    ...details,
                                    [item[0]]: value

                                  })
                                }
                              }
                            >
                              <Picker.Item label={'Selecione'} value={undefined} />
                              {
                                item[1].map((value, index) => <Picker.Item key={index} label={value} value={value} />)
                              }
                            </Picker>
                          </View>
                          :
                          item[0] === 'estado_financeiro' || item[0] === 'opcionais' ?
                            <View>
                              {item[1].map((value, index) =>
                                <View key={index} style={{ flexDirection: "row", alignItems: "center" }} >
                                  <CheckBox
                                    tintColors={{ true: "#6D0AD6", false: "#AAAAAA" }}
                                    value={!_.isEmpty(details[item[0]]) && details[item[0]].includes(value) ? true : false}

                                    onValueChange={
                                      () => {
                                        details[item[0]] ?
                                          setDetails({
                                            ...details, [item[0]]:
                                              details[item[0]].includes(value) ?
                                                details[item[0]].filter(item => item !== value)
                                                :
                                                [...details[item[0]], value]
                                          })
                                          :
                                          setDetails({ ...details, [item[0]]: [value] })
                                      }
                                    }
                                  />

                                  <Text>{value}</Text>
                                </View>
                              )
                              }
                            </View>

                            :

                            <View>
                              {item[1].map((value, index) =>
                                <View key={index} style={{ flexDirection: "column", marginBottom: 10 }}  >
                                  <Text style={{ fontSize: 16, textTransform: "capitalize", marginBottom: 5 }} >{value.replace(/[^a-z0-9-]/g, ' ')}</Text>
                                  <View
                                    style={{
                                      borderWidth: StyleSheet.hairlineWidth,
                                      borderColor: "#666",

                                      borderRadius: 5,
                                      paddingLeft: 10
                                    }}
                                  >

                                    {value === 'aceita_trocas' || value === 'unico_dono' ?

                                      <Picker
                                        style={{ height: 50, width: '100%' }}
                                        selectedValue={
                                          !_.isEmpty(details[item[0]]) && details[item[0]].find(x => x[value]) ?
                                            details[item[0]].find(x => x[value])[value] : ''
                                        }

                                        onValueChange={
                                          aux => {
                                            if (aux === undefined)
                                              return null;

                                            details[item[0]] ?
                                              setDetails({
                                                ...details, [item[0]]:
                                                  details[item[0]].find(x => x[value]) ?
                                                    details[item[0]].map(p =>
                                                      p[value]
                                                        ? { ...p, [value]: aux }
                                                        : p
                                                    ) :
                                                    [...details[item[0]], { [value]: aux }]
                                              })
                                              :
                                              setDetails({ ...details, [item[0]]: [{ [value]: aux }] })
                                          }
                                        }
                                      >
                                        <Picker.Item enabled={false} label={'Selecione'} />
                                        <Picker.Item label={'Sim'} value={'true'} />
                                        <Picker.Item label={'Não'} value={'false'} />
                                      </Picker>

                                      :

                                      <TextInput
                                        onChangeText={
                                          aux => {
                                            details[item[0]] ?

                                              setDetails({
                                                ...details, [item[0]]:
                                                  details[item[0]].find(x => x[value] !== undefined) ?
                                                    details[item[0]].map(p =>
                                                      p[value]
                                                        ? { ...p, [value]: aux }
                                                        : p
                                                    ) :
                                                    [...details[item[0]], { [value]: aux }]
                                              })
                                              :
                                              setDetails({ ...details, [item[0]]: [{ [value]: aux }] })

                                          }
                                        }

                                      />
                                    }
                                  </View>
                                </View>
                              )}
                            </View>
                        :
                        <Text>{item[1]}</Text>
                      }
                    </View>)
                    : undefined
                )}
              </View>
              :
              undefined
          }

          <View>
            <Text style={{ marginVertical: 10, fontSize: 16 }} >Preço (R$)</Text>

            <TextInput
              onChangeText={setPrice}
              style={{
                width: 160,
                paddingHorizontal: 15,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: "#0000008a",
                borderRadius: 8,
              }}

              placeholder=""
            />
          </View>

          <View>
            <Text style={{ marginVertical: 10, fontSize: 16 }} >CEP*</Text>

            <TextInput
              onChangeText={setCep}
              style={{
                width: 160,
                paddingHorizontal: 15,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: "#0000008a",
                borderRadius: 8,
              }}

              placeholder="Seu CEP aqui"
            />
          </View>

          <View style={{
            flexDirection: "row",
            alignItems: "center",
          }}
          >
            <CheckBox
              tintColors={{ true: "#6D0AD6", false: "#AAAAAA" }}
              value={checkBox}
              onValueChange={() => checkBox ? setCheckBox(false) : setCheckBox(true)}
              style={{
                marginVertical: 10,
                marginLeft: -7,
                padding: 0
              }}
            />

            <Text style={{ fontWeight: "700" }}>Ocultar meu telefone neste anúncio</Text>
          </View>

          <TouchableOpacity

            onPress={handleSubmit}

            style={{
              backgroundColor: "#F88323",
              justifyContent: "center",
              alignItems: "center",
              padding: 15,
              borderRadius: 25,
            }}
          >
            <Text style={{ color: "#FFFFFF" }}> Enviar anúncio</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const mapStateToProps = state => ({
  logged: state.app.logged,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  SignIn,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(InsertAD);