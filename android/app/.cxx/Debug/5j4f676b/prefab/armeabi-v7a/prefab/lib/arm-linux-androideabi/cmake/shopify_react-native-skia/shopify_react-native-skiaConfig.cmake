if(NOT TARGET shopify_react-native-skia::rnskia)
add_library(shopify_react-native-skia::rnskia SHARED IMPORTED)
set_target_properties(shopify_react-native-skia::rnskia PROPERTIES
    IMPORTED_LOCATION "C:/proyectos/hex-map-app/node_modules/@shopify/react-native-skia/android/build/intermediates/cxx/Debug/2p294g4g/obj/armeabi-v7a/librnskia.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/proyectos/hex-map-app/node_modules/@shopify/react-native-skia/android/build/headers/rnskia"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

