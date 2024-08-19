# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_08_19_170029) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "action_text_rich_texts", force: :cascade do |t|
    t.string "name", null: false
    t.text "body"
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["record_type", "record_id", "name"], name: "index_action_text_rich_texts_uniqueness", unique: true
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "addresses", force: :cascade do |t|
    t.bigint "store_id", null: false
    t.string "city", null: false
    t.string "slogan"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "slogan_params"
    t.boolean "active", default: false, null: false
    t.string "description"
    t.integer "total_games"
    t.index ["store_id"], name: "index_addresses_on_store_id"
  end

  create_table "avito_tokens", force: :cascade do |t|
    t.bigint "store_id", null: false
    t.string "access_token", null: false
    t.integer "expires_in", null: false
    t.string "token_type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["store_id"], name: "index_avito_tokens_on_store_id"
  end

  create_table "ban_lists", force: :cascade do |t|
    t.bigint "store_id", null: false
    t.string "ad_id"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "report_id"
    t.index ["ad_id"], name: "index_ban_lists_on_ad_id", unique: true
    t.index ["store_id"], name: "index_ban_lists_on_store_id"
  end

  create_table "exception_tracks", force: :cascade do |t|
    t.string "title"
    t.text "body"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "game_black_lists", force: :cascade do |t|
    t.string "game_id", null: false
    t.string "comment", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["game_id"], name: "index_game_black_lists_on_game_id", unique: true
  end

  create_table "games", force: :cascade do |t|
    t.string "name", null: false
    t.string "sony_id", null: false
    t.boolean "rus_voice", default: false, null: false
    t.boolean "rus_screen", default: false, null: false
    t.bigint "price", null: false
    t.bigint "old_price"
    t.date "discount_end_date"
    t.string "platform", null: false
    t.bigint "top", null: false
    t.bigint "run_id", null: false
    t.bigint "touched_run_id", null: false
    t.string "md5_hash", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "price_tl", default: 0, null: false
    t.index ["md5_hash"], name: "index_games_on_md5_hash", unique: true
    t.index ["run_id"], name: "index_games_on_run_id"
    t.index ["sony_id"], name: "index_games_on_sony_id", unique: true
    t.index ["touched_run_id"], name: "index_games_on_touched_run_id"
  end

  create_table "good_job_batches", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "description"
    t.jsonb "serialized_properties"
    t.text "on_finish"
    t.text "on_success"
    t.text "on_discard"
    t.text "callback_queue_name"
    t.integer "callback_priority"
    t.datetime "enqueued_at"
    t.datetime "discarded_at"
    t.datetime "finished_at"
  end

  create_table "good_job_executions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "active_job_id", null: false
    t.text "job_class"
    t.text "queue_name"
    t.jsonb "serialized_params"
    t.datetime "scheduled_at"
    t.datetime "finished_at"
    t.text "error"
    t.integer "error_event", limit: 2
    t.text "error_backtrace", array: true
    t.uuid "process_id"
    t.interval "duration"
    t.index ["active_job_id", "created_at"], name: "index_good_job_executions_on_active_job_id_and_created_at"
    t.index ["process_id", "created_at"], name: "index_good_job_executions_on_process_id_and_created_at"
  end

  create_table "good_job_processes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "state"
    t.integer "lock_type", limit: 2
  end

  create_table "good_job_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "key"
    t.jsonb "value"
    t.index ["key"], name: "index_good_job_settings_on_key", unique: true
  end

  create_table "good_jobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "queue_name"
    t.integer "priority"
    t.jsonb "serialized_params"
    t.datetime "scheduled_at"
    t.datetime "performed_at"
    t.datetime "finished_at"
    t.text "error"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "active_job_id"
    t.text "concurrency_key"
    t.text "cron_key"
    t.uuid "retried_good_job_id"
    t.datetime "cron_at"
    t.uuid "batch_id"
    t.uuid "batch_callback_id"
    t.boolean "is_discrete"
    t.integer "executions_count"
    t.text "job_class"
    t.integer "error_event", limit: 2
    t.text "labels", array: true
    t.uuid "locked_by_id"
    t.datetime "locked_at"
    t.index ["active_job_id", "created_at"], name: "index_good_jobs_on_active_job_id_and_created_at"
    t.index ["batch_callback_id"], name: "index_good_jobs_on_batch_callback_id", where: "(batch_callback_id IS NOT NULL)"
    t.index ["batch_id"], name: "index_good_jobs_on_batch_id", where: "(batch_id IS NOT NULL)"
    t.index ["concurrency_key"], name: "index_good_jobs_on_concurrency_key_when_unfinished", where: "(finished_at IS NULL)"
    t.index ["cron_key", "created_at"], name: "index_good_jobs_on_cron_key_and_created_at_cond", where: "(cron_key IS NOT NULL)"
    t.index ["cron_key", "cron_at"], name: "index_good_jobs_on_cron_key_and_cron_at_cond", unique: true, where: "(cron_key IS NOT NULL)"
    t.index ["finished_at"], name: "index_good_jobs_jobs_on_finished_at", where: "((retried_good_job_id IS NULL) AND (finished_at IS NOT NULL))"
    t.index ["labels"], name: "index_good_jobs_on_labels", where: "(labels IS NOT NULL)", using: :gin
    t.index ["locked_by_id"], name: "index_good_jobs_on_locked_by_id", where: "(locked_by_id IS NOT NULL)"
    t.index ["priority", "created_at"], name: "index_good_job_jobs_for_candidate_lookup", where: "(finished_at IS NULL)"
    t.index ["priority", "created_at"], name: "index_good_jobs_jobs_on_priority_created_at_when_unfinished", order: { priority: "DESC NULLS LAST" }, where: "(finished_at IS NULL)"
    t.index ["priority", "scheduled_at"], name: "index_good_jobs_on_priority_scheduled_at_unfinished_unlocked", where: "((finished_at IS NULL) AND (locked_by_id IS NULL))"
    t.index ["queue_name", "scheduled_at"], name: "index_good_jobs_on_queue_name_and_scheduled_at", where: "(finished_at IS NULL)"
    t.index ["scheduled_at"], name: "index_good_jobs_on_scheduled_at", where: "(finished_at IS NULL)"
  end

  create_table "image_layers", force: :cascade do |t|
    t.string "title"
    t.json "layer_params"
    t.integer "layer_type", default: 0
    t.bigint "store_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "menuindex", default: 0
    t.boolean "active", default: false, null: false
    t.index ["store_id"], name: "index_image_layers_on_store_id"
  end

  create_table "products", force: :cascade do |t|
    t.string "title", null: false
    t.text "description", null: false
    t.integer "price", null: false
    t.string "ad_status"
    t.string "category"
    t.string "goods_type"
    t.string "ad_type"
    t.string "condition"
    t.string "allow_email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "contact_method"
    t.boolean "active", default: false
    t.string "type"
    t.string "platform"
    t.string "localization"
    t.bigint "user_id"
    t.index ["user_id"], name: "index_products_on_user_id"
  end

  create_table "runs", force: :cascade do |t|
    t.string "status", default: "processing", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_runs_on_status"
  end

  create_table "settings", force: :cascade do |t|
    t.string "var"
    t.string "value"
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["user_id"], name: "index_settings_on_user_id"
    t.index ["var", "user_id"], name: "index_settings_on_var_and_user_id", unique: true
  end

  create_table "stores", force: :cascade do |t|
    t.string "var", null: false
    t.string "ad_status"
    t.string "category", null: false
    t.string "goods_type", null: false
    t.string "ad_type", null: false
    t.text "description", null: false
    t.string "condition", null: false
    t.string "allow_email", null: false
    t.string "manager_name", null: false
    t.string "contact_phone", null: false
    t.string "table_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "menuindex", default: 0
    t.jsonb "game_img_params"
    t.boolean "active", default: false, null: false
    t.string "contact_method"
    t.text "desc_game"
    t.text "desc_product"
    t.string "type"
    t.string "client_id"
    t.string "client_secret"
    t.bigint "user_id"
    t.integer "percent", default: 0, null: false
    t.index ["user_id"], name: "index_stores_on_user_id"
  end

  create_table "streets", force: :cascade do |t|
    t.string "title"
    t.bigint "address_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["address_id", "title"], name: "index_streets_on_address_id_and_title", unique: true
    t.index ["address_id"], name: "index_streets_on_address_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "addresses", "stores"
  add_foreign_key "avito_tokens", "stores"
  add_foreign_key "ban_lists", "stores"
  add_foreign_key "game_black_lists", "games", primary_key: "sony_id"
  add_foreign_key "image_layers", "stores"
  add_foreign_key "products", "users"
  add_foreign_key "settings", "users"
  add_foreign_key "stores", "users"
  add_foreign_key "streets", "addresses"
end
