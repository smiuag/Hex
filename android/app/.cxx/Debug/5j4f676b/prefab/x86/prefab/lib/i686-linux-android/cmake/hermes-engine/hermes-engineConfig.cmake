if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/diego/.gradle/caches/8.13/transforms/35675df85bd02bb3d2682c8049acc4ba/transformed/hermes-android-0.79.5-debug/prefab/modules/libhermes/libs/android.x86/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/diego/.gradle/caches/8.13/transforms/35675df85bd02bb3d2682c8049acc4ba/transformed/hermes-android-0.79.5-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

