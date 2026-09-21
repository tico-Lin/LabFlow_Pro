fn main() {
    std::env::set_var("PROTOC", protoc_bin_vendored::protoc_bin_path().unwrap());
    prost_build::Config::new()
        .out_dir("src")
        .compile_protos(&["../proto/labflow.proto"], &["../proto"])
        .expect("Failed to compile Protobuf schemas");
}

