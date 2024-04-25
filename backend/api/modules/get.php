                    <?php

                    require_once 'global.php';

                    class Get extends GlobalMethods
                    {
                        private $pdo;

                        public function __construct(\PDO $pdo)
                        {
                            $this->pdo = $pdo;
                        }

                        private function get_records($table, $conditions = null)
                        {
                            $sqlStr = "SELECT * FROM $table";
                            if ($conditions != null) {
                                $sqlStr .= " WHERE " . $conditions;
                            }
                            return $this->executeQuery($sqlStr);
                        }

                        private function executeQuery($sql)
                        {
                            try {
                                $stmt = $this->pdo->prepare($sql);
                                $stmt->execute();

                                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                $rowCount = $stmt->rowCount();

                                if ($rowCount > 0) {
                                    $code = 200;
                                    return $this->sendPayload($data, 'success', "Successfully retrieved data.", 200);
                                } else {
                                    return $this->sendPayload(null, 'failed', "No data found.", 404);
                                }
                            } catch (PDOException $e) {
                                return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
                            }
                        }

                        public function get_User($user = null)
                        {
                            $condition = null;
                            if ($user != null) {
                                $condition = "user_id=$user";
                            }
                            return $this->get_records('user', $condition);
                        }

                        public function get_UserID($user_id = null)
                        {
                            $condition = ($user_id !== null) ? "user_id=$user_id" : null;
                            return $this->get_records('user', $condition);
                        }

                        public function get_events($event_id = null)
                        {
                            if ($event_id !== null) {
                                $condition = "event_id=$event_id";
                            } else {
                                $condition = null;
                            }
                            return $this->get_records('events', $condition);
                        }

                        public function get_AllEvents()
                        {
                            return $this->get_events();
                        }
                    }
