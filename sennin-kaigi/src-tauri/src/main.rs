// Windows のリリースビルドでコンソール窓を出さない
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    sennin_kaigi_lib::run()
}
